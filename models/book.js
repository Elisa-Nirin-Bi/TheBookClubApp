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
    type: String
  },
  review: {
    type: String,
    maxlength: 300
  },
  bookList: {
    type: String,
    default: 'booklist'
  }
});

const Book = mongoose.model('Book', schema);

module.exports = Book;
