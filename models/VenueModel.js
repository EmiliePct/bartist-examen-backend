const mongoose = require('mongoose');

const venueSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
  name: String,
  type: String,
  address: String,
  description: String,
  picture: String,
  isProfileCompleted: Boolean
});

const Venue = mongoose.model('venues', venueSchema);

module.exports = Venue;
