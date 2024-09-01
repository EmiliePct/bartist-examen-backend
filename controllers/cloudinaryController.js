const express = require("express");
const cloudinary = require('cloudinary').v2;
const app = express();
const uniqid = require('uniqid');
const fs = require('fs');

const fileUpload = require('express-fileupload');

// Configuration de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadFile = async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
  
    if (!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        res.json({ result: true, url: resultCloudinary.secure_url });
      } else {
        res.json({ result: false, error: resultMove });
      }
    
      fs.unlinkSync(photoPath);


    // if (req.files && req.files.image) {
    //     try {
    //         // Utilisation de la promesse avec async/await
    //         const resultCloudinary = await cloudinary.uploader.upload(req.files.image.tempFilePath);
    //         res.json({ result: true, imageUrl: resultCloudinary.url });
    //     } catch (error) {
    //         console.log('error upload controller : ', error);
    //         res.status(500).json({ result: false, error: error.message });
    //     }
    // } else {
    //     res.status(400).json({ result: false, error: "No file uploaded" });
    // }
};