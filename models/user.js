'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHashAndSalt: {
    type: String
  },
  bio: {
    type: String
<<<<<<< HEAD
  } //,
  // profilePhoto: {
  //   type: DataView
  // }
=======
  },
  profilePhoto: {
    type: Buffer
  }
>>>>>>> 021b1e4295aa11c2669768df042dfb70ad1ed263
});

const User = mongoose.model('User', schema);

module.exports = User;
