'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  publisher: {
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
    // type: String
    type: mongoose.Schema.Types.ObjectId,
    // default: 'booklist',
    // required: true,
    ref: 'List'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

const Book = mongoose.model('Book', schema);

module.exports = Book;
