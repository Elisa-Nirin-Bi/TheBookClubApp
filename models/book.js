'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String
  },
  image: {
    path: String,
    originalName: String
  },
  review: {
    type: String,
    maxlength: 300
  }
});

const Book = mongoose.model('Book', schema);

module.exports = Book;
