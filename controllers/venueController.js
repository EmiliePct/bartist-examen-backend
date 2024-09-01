var express = require("express");
var router = express.Router();
const mongoose = require("mongoose")
const Venue = require("../models/VenueModel");
const { checkBody } = require("../utils/checkBody");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const token = uid2(32);


// POST signup
exports.signUpVenue = async (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if the email has not already been registered
  Venue.findOne({ email: req.body.email }).then(venue => {
    if (venue === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newVenue = new Venue({
        email: req.body.email,
        password: hash,
        token: uid2(32),
        isProfileCompleted: false,
      });

      newVenue.save().then(newVenueSaved => {
        res.json({ result: true, token: newVenueSaved.token });
      });
    } else {
      // email already exists in database
      res.json({ result: false, error: 'Venue already exists' });
    }
  });
};

// POST signin
exports.signInVenue = async (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the email has not already been registered
  Venue.findOne({ email: req.body.email }).then(venue => {
    if (venue && bcrypt.compareSync(req.body.password, venue.password)) {
      res.json({ result: true, token: venue.token, isProfileCompleted: venue.isProfileCompleted });
    } else {
      res.json({ result: false, error: 'email not found or wrong password' });
    }
  });
};

// POST create profil
exports.createProfileVenue = async (req, res) => {
  if (!checkBody(req.body, ['name'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if token has been registered
  Venue.findOne({ token: req.params.token }).then(venue => {
    if (venue === null) {
      // Token doesn't exist in the database
      res.json({ result: false, error: 'Venue does not exist' });      
    } else {
      console.log(req.body.type)
      // Complete profile with new data in venues
      venue.name = req.body.name;
      venue.type = req.body.type;
      venue.address = req.body.address;
      venue.description = req.body.description;
      venue.picture = req.body.picture;
      venue.isProfileCompleted = true;
      // Save the updated profile in the db
      venue.save().then(newProfile => {
        res.json({ result: true, message: 'Profile Created', newProfile, type: req.body.type });
      });
    }
  });
};

// RECUPERATION INFOS D'UN VENUE
exports.getVenueById = (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, message: 'Invalid ID' });
  }

  Venue.findOne({ _id: id })
    .then(venue => {
      if (venue) {
        res.status(200).json({ result: true, venue });
      } else {
        res.status(404).json({ result: false, message: 'venue not found' });
      }
    })
    .catch(error => {
      console.error("Error fetching venue:", error);
      res.status(500).json({ result: false, message: 'Error' });
    });
};



exports.getVenueByToken = (req, res) => {
  try{
    Venue.findOne({ token: req.params.token }).then(venue => {
      if (venue) {
        res.status(200).json({ result: true, venue });
      } else {
        res.status(404).json({ result: false, message: 'User not found' });
      }
    });
  }catch(error){
    res.status(500).json({ result: false, message: 'Error' });
  }
};