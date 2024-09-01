var express = require("express");
var router = express.Router();

const {
  signUpVenue,
  signInVenue,
  createProfileVenue,
  getVenueByToken,
  getVenueById,
} = require("../controllers/venueController");

// GET un venue
router.get("/id/:id", getVenueById);
router.get("/token/:token", getVenueByToken)

// POST signup
router.post("/signUp", signUpVenue);

// POST signin
router.post("/signIn", signInVenue);

// POST create profil
router.post("/createProfile/:token", createProfileVenue);

module.exports = router;
