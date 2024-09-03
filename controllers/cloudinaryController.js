const express = require("express");
const cloudinary = require('cloudinary').v2;
const app = express();
const uniqid = require('uniqid');
const Venue = require("../models/VenueModel");
const Artist = require("../models/ArtistModel");
const fs = require('fs');
const { uploadFile } = require("../utils/uploadFile");

// Configuration de Cloudinary
cloudinary.config({
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // api_key: process.env.CLOUDINARY_API_KEY,
    // api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

exports.uploadProfilePicture = async (req, res) => {
  //(isVenue, token, image, isForUser, isForEvent, eventId)
  try {
    // Extraction des données depuis la requête
    const { isVenue, token } = req.body;
    const image = req.files ? req.files.image : null;

    // Vérification de la présence de l'image
    if (!image) {
      return res.status(400).json({ result: false, message: "No image file uploaded." });
    }
    const isForUser = true;
    const isForEvent = false;
    const eventId = null;
    // Appel à la fonction d'upload
    const url = await uploadFile(isVenue, token, image, isForUser, isForEvent, eventId);
    console.log("url", url)
    // Envoi de la réponse avec l'URL de l'image
    res.json({ result: true, url });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ result: false, message: "An error occurred while uploading the profile picture." });
  }
}

/* fonctionne mais je voudrais faire appel au module */
// exports.uploadProfilePicture = async (req, res) => {
//   // 1 - define local path for photo file
//     const photoPath = `./tmp/${uniqid()}.jpg`;
//     const isUserVenue = req.body.isVenue;
//     const userToken = req.body.token;

//   // 2 - move photo file from request to temporary local storage (ici changer photoFromFront ?)
//     const resultMove = await req.files.image.mv(photoPath);
//   // 3 - analyse move error. if no error, move was successful
  
//     if (!resultMove) {
//       // 4 - upload file to permanent storage on Cloudinary server
//         const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//         // 5 - enregistrement en BDD selon type de user 
//         if(isUserVenue === true) {
//           Venue.findOne({ token: userToken }).then(venue => {
//             venue.picture = resultCloudinary.secure_url;
//             venue.save().then(newProfileWithPicture => {
//               res.json({ result: true, url: newProfileWithPicture.picture });
//             } )
//           })
//         } else {
//           Artist.findOne({ token: userToken }).then(artist => {
//             artist.picture = resultCloudinary.secure_url;
//             artist.save().then(newProfileWithPicture => {
//               res.json({ result: true, url: newProfileWithPicture.picture });
//             })
//           })
//         }
//       } else {
//         res.json({ result: false, error: resultMove });
//       }
//     // 6 - delete file from temporary storage - étape OK
//       fs.unlinkSync(photoPath);

// };