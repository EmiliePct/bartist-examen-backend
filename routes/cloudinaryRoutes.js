var express = require('express');
var router = express.Router();

const {
  uploadFile,
} = require("../controllers/cloudinaryController");

// Post upload fichier/img
router.post('/uploadFile', uploadFile)

module.exports = router;
