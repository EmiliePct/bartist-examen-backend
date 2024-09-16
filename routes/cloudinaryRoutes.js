var express = require('express');
var router = express.Router();

const {
  uploadProfilePicture,
} = require("../controllers/cloudinaryController");

// Post upload fichier/img
router.post('/uploadProfilePicture', uploadProfilePicture)
// rrajouter une route upload event picture

module.exports = router;
