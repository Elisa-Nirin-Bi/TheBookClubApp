'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: {
    type: String, // to be replaced
    default: 'anonymous'
  },
  text: {
    type: String,
    required: true
  },
  commentaries: {
    [{ type: String,
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
    type: String,
    default: 'booklist'
  }
});

const Review = mongoose.model('Review', schema);

module.exports = Review;
