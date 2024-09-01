const mongoose = require('mongoose');

const socialsSchema = mongoose.Schema({
    facebook: String,
    instagram: String,
})

const eventSchema = mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  hour_start: String,
  picture: String,
  status: String,
  socials: socialsSchema,
  venue: {type: mongoose.Schema.Types.ObjectId, ref: 'venues'},
  genres: [String],
});

const Event = mongoose.model('events', eventSchema);

module.exports = Event;
