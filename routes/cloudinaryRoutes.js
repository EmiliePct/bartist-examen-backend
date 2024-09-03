var express = require('express');
var router = express.Router();

const {
  uploadProfilePicture,
} = require("../controllers/cloudinaryController");

// Post upload fichier/img
router.post('/uploadProfilePicture', uploadProfilePicture)

module.exports = router;
