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
          res.json({ result: true, artist: newArtistSaved.token });
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
      res.json({ result: true, token: artist.token, isProfileCompleted: artist.isProfileCompleted}); // idée : rajouter ici un booléen isProfileCompleted, pareil pour venue pour savoir s'il faut rediriger vers le formulaire
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
};

//AJOUT D'INFORMATIONS - DEUXIEME ETAPE DE L'INSCRIPTION
exports.createProfileArtist = async (req, res) => {
  //Vérification que les champs obligatoires sont bien remplis - ou vérification en front ?
  if (!checkBody(req.body, ["name"])) {
    res.json({ result: false, error: "Missing or empty mandatory fields" });
    return;
  }
  Artist.updateOne(
    { token: req.params.token },
    {
      $set: {
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        members: req.body.members,
        picture: req.body.picture,
        genres: req.body.genres,
        socials: req.body.socials,
        isProfileCompleted: true,
      },
    }
  ).then(() => {
    Artist.find({ token: req.params.token }).then((newProfile) => {
      res.json({ result: true, message: "Profile created", newProfile });
    });
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
