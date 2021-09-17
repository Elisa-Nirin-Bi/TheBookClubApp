const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  listName: {
    type: String,
    default: 'bookList',
    required: true
  },
  listAvatar: {
    type: String
  },
  listCreator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  booksOnList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }
});

const List = mongoose.model('List', listSchema);

module.exports = List;
