const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Review'
    },
    message: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 300
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
