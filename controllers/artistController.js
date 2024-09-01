var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Artist = require("../models/ArtistModel");
const { checkBody } = require("../utils/checkBody");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const token = uid2(32);

//ROUTE INSCRIPTION
exports.signUpArtist = async (req, res) => {
  try {
    //Vérification que les champs sont bien remplis
    if (!checkBody(req.body, ["email", "password"])) {
      res.json({ result: false, error: "Missing or empty fields" });
      return;
    }
    // Vérification que le compte n'existe pas déjà
    Artist.findOne({ email: req.body.email }).then((artist) => {
      // le compte n'existe pas encore en BDD
      if (artist === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        const newArtist = new Artist({
          email: req.body.email,
          password: hash,
          token: uid2(32),
          isProfileCompleted: false,
        });
        newArtist.save().then((newArtistSaved) => {
          console.log("newArtistSaved en back", newArtistSaved)
          res.json({ result: true, token: newArtistSaved.token, isProfileCompleted: newArtistSaved.isProfileCompleted });
        });
      } else {
        // le compte existe déjà en BDD
        res.json({ result: false, error: "Artist already exists" });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//ROUTE CONNEXION
exports.signInArtist = async (req, res) => {
  //Vérification que les champs sont bien remplis
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  //Recherche de l'artiste en BDD
  Artist.findOne({ email: req.body.email }).then((artist) => {
    if (artist && bcrypt.compareSync(req.body.password, artist.password)) {
      console.log("artist.isProfileCompleted", artist.isProfileCompleted)
      console.log("artist", artist)
      res.json({ result: true, token: artist.token, isProfileCompleted: artist.isProfileCompleted}); // idée : rajouter ici un booléen isProfileCompleted, pareil pour venue pour savoir s'il faut rediriger vers le formulaire
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
};

//AJOUT D'INFORMATIONS - DEUXIEME ETAPE DE L'INSCRIPTION
exports.createProfileArtist = async (req, res) => {
  console.log("req.body", req.body)
  //Vérification que les champs obligatoires sont bien remplis - ou vérification en front ?
  if (!checkBody(req.body, ["name"])) {
    res.json({ result: false, error: "Missing or empty mandatory fields" });
    return;
  }
  Artist.findOne({ token: req.params.token }).then(artist => {
    if (artist === null) {
      // Token doesn't exist in the database
      res.json({ result: false, error: 'Artist does not exist' });      
    } else {
      const socials = {
        youtube: req.body.youtube, 
        deezer: req.body.deezer, 
        spotify: req.body.spotify, 
        soundcloud: req.body.soundcloud, 
        facebook: req.body.facebook, 
      }
      // Complete profile with new data in artist
      artist.name = req.body.name;
      artist.type = req.body.type;
      artist.members = req.body.members;
      artist.description = req.body.description;
      artist.picture = req.body.picture;
      artist.genres = req.body.genres,
      artist.socials = socials,
      artist.isProfileCompleted = true;
      // Save the updated profile in the db
      console.log('MAJ artiste', artist)
      artist.save().then(newProfile => {
        res.json({ result: true, message: 'Profile Created', newProfile, type: req.body.type });
      });
    }
  });
};


// RECUPERATION INFOS DE TOUT LES ARTISTES
exports.getArtists = (req, res) => {
  try {
    Artist.find().then((artists) => {
      if (artists) {
        res.status(200).json({ result: true, artists });
      } else {
        res.status(404).json({ result: false, message: "No artists found" });
      }
    });
  } catch (errror) {
    res.status(500).json({ result: false, message: "Internal server error" });
  }
};
// RECUPERATION INFOS D'UN ARTISTE
exports.getArtist = (req, res) => {
  try {
    Artist.findOne({ token: req.params.token }).then((artist) => {
      if (artist) {
        res.status(200).json({ result: true, artist });
      } else {
        res.status(404).json({ result: false, error: "Artist not found" });
      }
    });
  } catch (error) {
    res.status(500).json({ result: false, message: error.message });
  }
};

exports.getArtistById = (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, message: "Invalid ID" });
  }
  
  // idée : faire un findById au lieu d'un findOne ?
  Artist.findOne({ _id: id })
    .then((artist) => {
      if (artist) {
        res.status(200).json({ result: true, artist });
      } else {
        res.status(404).json({ result: false, message: "Artist not found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching artist:", error);
      res.status(500).json({ result: false, message: error.message });
    });
};
