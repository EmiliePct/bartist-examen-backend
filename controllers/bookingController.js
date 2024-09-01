var express = require("express");
var router = express.Router();

const Venue = require("../models/VenueModel");
const Artist = require("../models/ArtistModel");
const Booking = require("../models/BookingModel");
const { checkBody } = require("../utils/checkBody");

// Pour créer un booking
exports.createBooking = async (req, res) => {
  console.log(req.body)
  try {
    if (
      !checkBody(req.body, [
        "token",
        "artistId",
        "venueId",
        "eventId",
        "hour_start",
        "duration",
        "rate",
        "status",
        "description",
      ])
    ) {
      res.status(307).json({ result: false, error: "Missing or empty fields" });
      return;
    }
    //On vérifie que le token est valide, quel que soit le type de user
    if (req.body.isVenue){
      Venue.findOne({ token: req.body.token }).then(venue => {
        if(!venue){
          res.status(305).json({ result: false, message: "Not allowed venue user" })
        }
      })
    } else {
      Artist.findOne({token: req.body.token}).then(artist => {
        if(!artist){
          res.status(305).json({ result: false, message: "Not allowed artist user" })
        }
      })
    };
    
    const newBooking = new Booking({
      //je crée un objet booking
      artist: req.body.artistId,
      venue: req.body.venueId,
      event: req.body.eventId,
      hour_start: req.body.hour_start,
      duration: req.body.duration,
      rate: req.body.rate,
      status: req.body.status,
      description: req.body.description,
    });
    req.body.isVenue
      ? (newBooking.creatorIsVenue = true)
      : (newBooking.creatorIsVenue = false);
    newBooking.save().then((newBookingSaved) => {
      // j'enregistre le nouveau booking
      if (newBookingSaved) {
        res.status(200).json({ result: true, newBookingSaved });
      } else {
        res.status(302).json({
          result: false,
          message: "Booking not created",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ result: false, message: error.message });
  }
};

// Pour afficher tous les bookings du user dans la page "Mes propositions"
exports.displayAllBookings = async (req, res) => {
  console.log('rentré dans API displayAllBookings')
  if (req.body.isVenue) {
    // si le user connecté est un établissement
    Venue.findOne({ token: req.body.token }).then((dataVenue) => {
      if (dataVenue) {
        Booking.find({ venue: dataVenue._id }) // on recherche tous les bookings qui ont l'ID de l'établissement en clé étrangère
          .then((bookings) => {
            if (bookings) {
              console.log("bookings venue", bookings)
              res.json({ result: true, bookings });
            } else {
              res.json({ result: false, error: "No bookings found" });
            }
          });
      } else {
        res.json({ result: false, error: "Venue not found" });
      }
    });
  } else {
    // si le user connecté est un artist
    Artist.findOne({ token: req.body.token }).then((artist) => {
      if (artist) {
        Booking.find({ artist: artist._id }) // on recherche tous les bookings qui ont l'ID de l'artiste en clé étrangère
          .then((bookings) => {
            if (bookings) {
              console.log("bookings artist", bookings)

              res.json({ result: true, bookings });
            } else {
              res.json({ result: false, error: "No bookings found" });
            }
          });
      } else {
        res.json({ result: false, error: "Artist not found" });
      }
    });
  }
};

// Pour accepter ou refuser un booking en changeant son statut
exports.updateBookingStatus = async (req, res) => {
  Booking.updateOne({ _id: req.body._id }, { status: req.body.status })
    .then((booking) => {
      if (booking) {
        res.json({ result: true, booking });
      } else {
        res.json({ result: false, error: "Booking not found" });
      }
    }
  );
};


exports.getArtistBookedByEventId = async (req, res) => {
  try {
    if (req.params.id) {
      Booking.find({ event: req.params.id })
        .populate('artist', 'name')  // Spécifier que vous voulez seulement le nom de l'artiste
        .then(bookings => {
          if (bookings.length === 0) {
            res.status(404).json({ result: false, message: "No Booking Linked to Event" });
          } else {
            // Transformer les données pour ne renvoyer que le nom de l'artiste et le statut de la réservation
            const transformedBookings = bookings.map(booking => ({
              artistName: booking.artist.name, // Accéder au nom de l'artiste
              status: booking.status // Accéder au statut de la réservation
            }));
            res.status(200).json({ result: true, bookings: transformedBookings });
          }
        })
        .catch(error => {
          res.status(500).json({ result: false, message: error.message });
        });
    } else {
      res.status(400).json({ result: false, message: "Event ID not provided" });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: error.message });
  }
};
