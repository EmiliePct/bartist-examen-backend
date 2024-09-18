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

// async function uploadFile(isVenue, token, image, isForUser, isForEvent, eventId) {
//     console.log("rentré dans le module avec --> ")
//     console.log("isVenue", isVenue )
//     console.log("token", token )
//     console.log("image", image )
//     console.log("isForUser", isForUser )
//     console.log("isForEvent", isForEvent )
//     console.log("eventId", eventId )

//     // 1 - define local path for photo file
//     const photoPath = `./tmp/${uniqid()}.jpg`;

//     // 2 - move photo file from request to temporary local storage
//     try {
//         await image.mv(photoPath);

//         // 3 - upload file to permanent storage on Cloudinary server
//         const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//         let updateResult;
//         console.log('ici OK')
//         console.log('resultCloudinary', resultCloudinary)

//         // 4 - selon la cible de l'upload :
//         if (isForUser) {
//             console.log('condition isforuser')
//             console.log('isVenue', isVenue)

//             if (isVenue === true) {
//                 console.log("condition isVenue")
//                 updateResult = await Venue.updateOne(
//                     { token: token }, 
//                     { picture: resultCloudinary.secure_url }
//                 );
//             } 
//             if (isVenue === false) {
//                 console.log("condition isNotVenue");
//                 console.log("Token:", token);
//                 console.log("URL de l'image:", resultCloudinary.secure_url);
            
//                 try {
//                     const artist = await Artist.findOne({ token: token });
//                     console.log("Artiste trouvé:", artist);
            
//                     if (!artist) {
//                         throw new Error('Artist not found');
//                     }
            
//                     updateResult = await Artist.updateOne(
//                         { token: token },
//                         { $set: { picture: resultCloudinary.secure_url } }
//                     );
//                     console.log("Résultat de la mise à jour:", updateResult);
//                 } catch (updateError) {
//                     console.error("Erreur lors de la mise à jour:", updateError);
//                     throw updateError;
//                 }
//             }
            
//                     // Log pour inspecter le résultat de l'update
//         console.log("updateResult", updateResult);

//             if (updateResult && updateResult.modifiedCount > 0) {
//                 return resultCloudinary.secure_url;
//             } else {
//                 throw new Error('Update failed');
//             }
//         }

//         if (isForEvent === true) {
//             console.log('condition isForEvent')

//             updateResult = await Event.updateOne({ _id: eventId }, { picture: resultCloudinary.secure_url });

//             if (updateResult === true && updateResult.modifiedCount > 0) {
//                 return resultCloudinary.secure_url;
//             } else {
//                 throw new Error('Event update failed');
//             }
//         }

//     } catch (error) {
//         throw new Error(`Error during file upload: ${error.message}`);
//     } finally {
//         // 6 - delete file from temporary storage
//         fs.unlinkSync(photoPath);
//     }
// }

async function uploadFile(isVenue, token, image, isForUser, isForEvent, eventId) {
    console.log("Entrée dans le module uploadFile avec --> ");
    console.log("isVenue", isVenue);
    console.log("Token reçu dans uploadFile:", token);
    console.log("image", image);
    console.log("isForUser", isForUser);
    console.log("isForEvent", isForEvent);
    console.log("eventId", eventId);

    // 1 - define local path for photo file
    const photoPath = `./tmp/${uniqid()}.jpg`;

    try {
        // 2 - move photo file from request to temporary local storage
        await image.mv(photoPath);

        // 3 - upload file to permanent storage on Cloudinary server
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        console.log('Upload Cloudinary réussi');
        console.log('resultCloudinary', resultCloudinary);

        let updateResult;

        // 4 - selon la cible de l'upload :
        if (isForUser) {
            console.log('Condition isForUser');
            console.log('isVenue', isVenue);
            console.log('typeof isVenue', typeof(isVenue));


            if (isVenue == true) {
                console.log("Mise à jour pour un lieu");
                console.log("Token:", token);
                console.log("URL de l'image:", resultCloudinary.secure_url);

                console.log("Recherche du lieu avec le token:", token);
                const venue = await Venue.findOne({ token: token });
                console.log("Lieu trouvé:", venue);

                if (!venue) {
                    throw new Error('Venue not found');
                }

                updateResult = await Venue.findOneAndUpdate(
                    { token: token },
                    { $set: { picture: resultCloudinary.secure_url } },
                    { new: true }
                );
            } else {
                console.log("Mise à jour pour un artiste");
                console.log("Token:", token);
                console.log("URL de l'image:", resultCloudinary.secure_url);

                console.log("Recherche de l'artiste avec le token:", token);
                const artist = await Artist.findOne({ token: token });
                console.log("Artiste trouvé:", artist);

                if (!artist) {
                    throw new Error('Artist not found');
                }

                updateResult = await Artist.findOneAndUpdate(
                    { token: token },
                    { $set: { picture: resultCloudinary.secure_url } },
                    { new: true }
                );
            }

            console.log("Résultat de la mise à jour:", updateResult);

            if (updateResult) {
                console.log("Mise à jour réussie");
                return resultCloudinary.secure_url;
            } else {
                console.log("Échec de la mise à jour: Aucun document trouvé ou mis à jour");
                throw new Error('Update failed: No document found or updated');
            }
        }

        if (isForEvent === true) {
            console.log('Condition isForEvent');
            updateResult = await Event.findOneAndUpdate(
                { _id: eventId },
                { $set: { picture: resultCloudinary.secure_url } },
                { new: true }
            );

            if (updateResult) {
                console.log("Mise à jour de l'événement réussie");
                return resultCloudinary.secure_url;
            } else {
                console.log("Échec de la mise à jour de l'événement: Aucun document trouvé ou mis à jour");
                throw new Error('Event update failed: No document found or updated');
            }
        }

    } catch (error) {
        console.error("Erreur dans uploadFile:", error);
        throw new Error(`Error during file upload: ${error.message}`);
    } finally {
        // 6 - delete file from temporary storage
        try {
            fs.unlinkSync(photoPath);
            console.log("Fichier temporaire supprimé avec succès");
        } catch (unlinkError) {
            console.error("Erreur lors de la suppression du fichier temporaire:", unlinkError);
        }
    }
}

module.exports = { uploadFile };