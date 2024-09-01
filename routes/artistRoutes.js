var express = require("express");
var router = express.Router();

const {
  getArtist,
  getArtistById,
  getArtists,
  signUpArtist,
  signInArtist,
  createProfileArtist,
} = require("../controllers/artistController");

router.get("/", getArtists);
router.get("/id/:id", getArtistById)
router.get("/token/:token", getArtist);
router.post("/signUp", signUpArtist);
router.post("/signIn", signInArtist);
router.post("/createProfile/:token", createProfileArtist);

module.exports = router;
