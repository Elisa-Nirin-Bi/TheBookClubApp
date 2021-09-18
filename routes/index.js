'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const Book = require('../models/book');
const User = require('../models/user');
const List = require('../models/list');
const routeGuard = require('./../middleware/route-guard');
const upload = require('./../middleware/file-upload');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

// to rework - not working correctly:
router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.user._id;
  User.find({ id })
    .then((lists) => {
      res.render('profile', { lists });
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
