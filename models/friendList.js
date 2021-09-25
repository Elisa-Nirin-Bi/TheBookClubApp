const mongoose = require('mongoose');

const friendListSchema = new mongoose.Schema({
  friendAvatar: {
    type: String
  },
  friendsOnList: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  friendListOwner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

const FriendList = mongoose.model('FriendList', friendListSchema);

module.exports = FriendList;
