const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const Venue = require("../models/VenueModel");
const Artist = require("../models/ArtistModel");
const Event = require("../models/EventModel");
const fs = require('fs');

// Configuration de Cloudinary
cloudinary.config({
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // api_key: process.env.CLOUDINARY_API_KEY,
    // api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
async function uploadFile(isVenue, token, image, isForUser, isForEvent, eventId) {
    // 1 - define local path for photo file
    const photoPath = `./tmp/${uniqid()}.jpg`;

    // 2 - move photo file from request to temporary local storage
    try {
        await image.mv(photoPath);

        // 3 - upload file to permanent storage on Cloudinary server
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        let updateResult;

        // 4 - selon la cible de l'upload :
        if (isForUser) {
            if (isVenue === true) {
                updateResult = await Venue.updateOne({ token: token }, { picture: resultCloudinary.secure_url });
            } else {
                updateResult = await Artist.updateOne({ token: token }, { picture: resultCloudinary.secure_url });
            }

                    // Log pour inspecter le résultat de l'update
        console.log("updateResult", updateResult);

            if (updateResult && updateResult.modifiedCount > 0) {
                return resultCloudinary.secure_url;
            } else {
                throw new Error('Update failed');
            }
        }

        if (isForEvent) {
            updateResult = await Event.updateOne({ _id: eventId }, { picture: resultCloudinary.secure_url });

            if (updateResult && updateResult.modifiedCount > 0) {
                return resultCloudinary.secure_url;
            } else {
                throw new Error('Event update failed');
            }
        }

    } catch (error) {
        throw new Error(`Error during file upload: ${error.message}`);
    } finally {
        // 6 - delete file from temporary storage
        fs.unlinkSync(photoPath);
    }
}

module.exports = { uploadFile };