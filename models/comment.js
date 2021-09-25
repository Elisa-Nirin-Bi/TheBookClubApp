const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book'
    },
    message: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 300
    },
    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unlike: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: {
      createdAt: 'creationDate',
      updatedAt: 'editingDate'
    }
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
