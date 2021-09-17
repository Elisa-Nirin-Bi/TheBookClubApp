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
  },
  profilePhoto: {
    type: String
  },
  userLists: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }
});

const User = mongoose.model('User', schema);

module.exports = User;
