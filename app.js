require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var artistsRouter = require('./routes/artistRoutes');
var venuesRouter = require('./routes/venueRoutes');
var eventsRouter = require('./routes/eventRoutes');
var bookingsRouter = require('./routes/bookingRoutes');
var mediasRouter = require('./routes/cloudinaryRoutes');

require("./config/connection")

var app = express();

const cors = require('cors');
app.use(cors());

const fileUpload = require('express-fileupload');
// Middleware express-fileupload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/', // Chemin corrigé vers le répertoire temporaire
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes générales, renvois vers des fichiers routes spécifiques
app.use('/', indexRouter);
app.use('/medias', mediasRouter);
app.use('/artists', artistsRouter);
app.use('/venues', venuesRouter);
app.use('/events', eventsRouter);
app.use('/bookings', bookingsRouter);


module.exports = app;
