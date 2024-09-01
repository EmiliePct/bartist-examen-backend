require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.error(err));