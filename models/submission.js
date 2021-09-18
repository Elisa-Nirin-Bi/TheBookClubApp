const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    email: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
