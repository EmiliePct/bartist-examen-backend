var express = require("express");
var router = express.Router();
const mongoose = require("mongoose")

const Event = require("../models/EventModel");
const Venue = require("../models/VenueModel");
const Booking = require("../models/BookingModel")
const Artist = require("../models/ArtistModel")
const { checkBody } = require("../utils/checkBody");

//ROUTE CREATION D'EVENEMENT
exports.createEvent = async (req, res) => {
    //Vérification que les champs sont bien remplis
    if (!checkBody(req.body, ['title', 'date', 'hour_start', 'status', 'genres' ])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    // A rajouter éventuellement : Vérification qu'il n'y a pas déjà un event ce jour là ? ou peut-être un message d'alerte pour le user ?
    //Recherche de l'établissement d'après token de l'utilisateur connecté
    Venue.findOne({token: req.body.token})
        .then(venue => {
        // le compte Venue existe en BDD
        if (venue) {

          const newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            hour_start: req.body.hour_start,
            picture: req.body.picture,
            status: req.body.status,
            socials: req.body.socials,
            venue: venue._id,
            genres: req.body.genres,
          }); 
          
          newEvent.save().then(newEventSaved => {
            res.json({ result: true, newEventSaved });
          });
        } else {
          // le compte Venue n'existe pas en BDD 
          res.json({ result: false, error: 'Venue not found' });
        }
      });
  };

// Fonction GET pour récupérer tout les events
exports.getEvents = async (req, res) => {
  try{
    Event.find().then(events => {
      if (events){
        res.status(200).json({ result: true, events })
      } else {
        res.status(404).json({ result: false, message: "no data" })
      }
  })
  } catch(err) {
    res.status(500).json({ result: false, message: err.message})
  }
}  

// Route pour afficher events
exports.displayEvents = async (req, res) => { 
  // si connecté en tant que venue
    Venue.findOne({ token: req.params.token })// cherche si token en question est présent dans Venue
    .then(tokenVenue => {
      if (tokenVenue) { 
        try {
          //Si trouvé on cherche le venue qui correspond dans la collection event
          Event.find({ venue: tokenVenue._id }).then(dataEvent => {
            if (dataEvent.length) { // renvoie les correspondances
              res.json({ result: true, event: dataEvent });
            } else {
              res.json({ result: false, error: 'venue not found' });
            }
          });     
        } catch(error){
          console.log(error.message);
        }
      }
    });
};

exports.getEventById = (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, message: 'Invalid ID' });
  }

  Event.findOne({ _id: id })
    .then(event => {
      if (event) {
        res.status(200).json({ result: true, event });
      } else {
        res.status(404).json({ result: false, message: 'Event not found' });
      }
    })
    .catch(error => {
      console.error("Error fetching event:", error);
      res.status(500).json({ result: false, message: 'Error' });
    });
};

    // Obtenir tous les événements d'un établissement grâce à son token
exports.getEventsByVenueToken = async (req, res) => {
  try{
      Venue.findOne({token: req.params.token}) // on récupère l'ID de l'établissement grâce à son token
      .then(dataVenue => {
        if (dataVenue) {
          Event.find({venue: dataVenue._id}) // on cherche tous les événéments qui ont comme clé étrangère venue l'ID de l'établissement
          .then(events => {
            if (events) {
              res.json({ result: true, events })
            } else {
              res.json({ result:false, error:"No events found" })
            }
          })
        } else {
            res.json({ result:false, error:"Venue not found" })
        }
    });
  } catch(error){
    console.log(error.message);
  }
}

    //Route DELETE event
exports.deleteEvent = async (req, res) => {
  // Ne pas passer l'id en params pour que la route fonctionnne
      try{
        //Si trouvé, cherche le venue qui correspond dans la collection event pour le delete
        Event.deleteOne({ _id: req.body._id }) // La cle correspond a ce qu'on a en bdd, et le req.param fait reference a la route
        .then(data => {
            if (data.deletedCount > 0) { // cf doc mongoose
                res.json({ result: true, message: "This event has been successfully deleted" })
            } else {
                res.json({ result: false, error:"Event not found" })
            }
        });
      } catch(error){
        console.log(error.message);
      }
};

    // Route update event's status
exports.updateEventStatus = async (req, res) => {
  try{
      Event.updateOne({_id: req.body._id}, { status: req.body.status})
      .then(data => {
        if(data){
          res.json({ result: true, message: "This status has been modified" })
        } else {
            res.json({ result: false, error: "Status not found" })
        }
    });
  } catch(error){
    console.log(error.message);
  }
};

exports.displayEventsByBooking = async (req, res) => {
  try{
    Artist.findOne({token: req.params.token}).then(data => {
      console.log(data)
      if (!data) {
        res.status(400).json({ result: false, message: "Your are not an allowed user" })
      } else {
        Booking.find({artist: data._id}).populate('event').then(events => {
          if (events) {
            res.status(200).json({ result: true, message: "Events Booked", events})
          } else {
            res.status(402).json({ result: false, message: "No Events Booked Yet" })
          }
        })
      }
    })
  } catch (error) {
    res.status(500).json({ result: false, message: "Controller Error contact with DB" })
  }
}

