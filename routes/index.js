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
  console.log(name);
  let noInput;
  User.find({ name })
    .then((userSearched) => {
      console.log(name);
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
  List.find({ listCreator: id })
    .then((lists) => {
      res.render('profile', { lists, profile: true });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/userprofilepage/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let searchedUser;
  return User.findById(id)
    .then((friend) => {
      searchedUser = friend;
      return List.find({ listCreator: id });
    })
    .then((lists) => {
      res.render('profile-friend', { searchedUser, lists, searchUser: true });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/userprofilepage/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let searchedUser;
  return User.findById(id)
    .then((friend) => {
      searchedUser = friend;
      return FriendList.find({ listCreator: id });
    })
    .then((lists) => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/edit-profile', routeGuard, (req, res, next) => {
  res.render('edit-profile');
});

router.post(
  '/edit-profile',
  routeGuard,
  upload.single('profilePhoto'),
  (req, res, next) => {
    const id = req.user._id;
    const { name, email, bio } = req.body;
    let profilePhoto;
    if (req.file) {
      profilePhoto = req.file.path;
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
