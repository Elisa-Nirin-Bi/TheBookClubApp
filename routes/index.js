'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const Book = require('../models/book');
const User = require('../models/user');
const List = require('../models/list');
const FriendList = require('../models/friendList');
const routeGuard = require('./../middleware/route-guard');
const upload = require('./../middleware/file-upload');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!', home: true });
});

router.get('/search-user', routeGuard, (req, res, next) => {
  let name = req.query.name;
  let noInput;
  return User.find({ name })
    .then((userSearched) => {
      if (!name) {
        noInput = true;
      }
      res.render('search-user', {
        userSearched,
        noInput,
        searchUser: true
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let lists;
  List.find({ listCreator: id })
    .then((doc) => {
      lists = doc;
      return FriendList.find({ friendListOwner: req.user._id }).populate(
        'friendsOnList'
      );
    })
    .then((friendList) => {
      res.render('profile', { friendList, lists, profile: true });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/userprofilepage/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let searchedUser;
  let lists;
  return User.findById(id)
    .then((friend) => {
      searchedUser = friend;
      return List.find({ listCreator: id });
    })
    .then((doc) => {
      lists = doc;
      return FriendList.find({ friendsOnList: searchedUser });
    })
    .then((existingFriend) => {
      if (id === String(req.user._id)) {
        res.redirect(`/profile/${id}`);
      }
      if (!existingFriend.length) {
        res.render('profile-friend', {
          friend: true,
          searchedUser,
          lists,
          searchUser: true
        });
      } else {
        res.render('profile-friend', {
          friend: false,
          searchedUser,
          lists,
          searchUser: true
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/userprofilepage/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  // let searchedUser;
  return User.findById(id)
    .then((friend) => {
      // searchedUser = friend;
      return FriendList.create({
        friendsOnList: friend,
        friendListOwner: req.user._id
      });
    })
    .then((friendList) => {
      res.redirect(`/userprofilepage/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/userprofilepage/:id/remove', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  return FriendList.findOneAndDelete({ friendsOnList: id })
    .then(() => {
      res.redirect(`/profile/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.get(
  '/edit-profile',
  routeGuard,

  (req, res, next) => {
    res.render('edit-profile');
  }
);

router.post(
  '/edit-profile',
  routeGuard,
  upload.single('profilePhoto'),
  (req, res, next) => {
    const id = req.user._id;
    const { name, email, bio, removeProfilePhoto } = req.body;
    let profilePhoto;
    if (req.file) {
      profilePhoto = req.file.path;
      // console.log('req file path is :', req.file, req.file.path);
    }
    if (removeProfilePhoto === './../images/no-user-profile-pic.png') {
      profilePhoto = '';
    }
    User.findByIdAndUpdate(id, {
      name,
      email,
      bio,
      profilePhoto
    })
      .then((doc) => {
        res.redirect(`/profile/${id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = router;
