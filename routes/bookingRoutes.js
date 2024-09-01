var express = require("express");
var router = express.Router();

const {
  getArtistBookedByEventId,
  createBooking,
  displayAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");


router.get("/id/:id", getArtistBookedByEventId)
router.post("/createBooking", createBooking);
router.post("/displayAllBookings", displayAllBookings);
router.post("/updateBookingStatus", updateBookingStatus);


module.exports = router;
