'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const Book = require('../models/book');
const User = require('../models/user');
const routeGuard = require('./../middleware/route-guard');
const upload = require('./../middleware/file-upload');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'The Book Club' });
});

router.get('/search-user', routeGuard, (req, res, next) => {
  const name = req.query.name;
  User.find({ name })
    .then((user) => {
      res.render('search-user', {
        user
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      res.render('profile', { user });
    })
    .catch((error) => {
      next(error);
    });
});

// to rework - not working correctly:
/*router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .then((userList) => {
      res.render('profile', { userList });
    })
    .catch((error) => {
      next(error);
    });
});*/

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
