const mongoose = require('mongoose');

const socialsSchema = mongoose.Schema({
  youtube: String,
  soundcloud: String,
  facebook: String,
  deezer: String,
  spotify: String,
})

const artistSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
  name: String,
  description: String,
  type: String,
  members: Number,
  picture: String,
  genres: [String],
  socials: socialsSchema,
  isProfileCompleted: Boolean
});

const Artist = mongoose.model('artists', artistSchema);

module.exports = Artist;