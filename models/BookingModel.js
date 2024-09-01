const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  event: {type: mongoose.Schema.Types.ObjectId, ref: 'events'},
  artist: {type: mongoose.Schema.Types.ObjectId, ref: 'artists'},
  venue: {type: mongoose.Schema.Types.ObjectId, ref: 'venues'},
  description: String,
  rate: Number,
  status: String,
  hour_start: String,
  duration: Number,
  creatorIsVenue: Boolean,
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;
