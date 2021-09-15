'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const bcryptjs = require('bcryptjs');
const Book = require('../models/book');
const User = require('../models/user');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

// to rework - not working correctly:
router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .then((list) => {
      res.render('profile', { customList: list });
    })
    .catch((error) => {
      next(error);
    });
});

// to create new model for lists? to rework the below and create-list.hbs

router.get('/create-list', routeGuard, (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .then((list) => {
      res.render('create-list');
    })
    .catch((error) => {
      next(error);
    });
});

/*
let customList = [];

router.post('/create-list', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const customListInput = req.body.customList;
  customList.push(customListInput);
  User.findByIdAndUpdate(id, {
    customList
  })
    .then((list) => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});
*/

router.get('/edit-profile', routeGuard, (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .then(() => {
      res.render('edit-profile');
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/edit-profile', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { name, email, bio } = req.body;
  User.findByIdAndUpdate(id, {
    name,
    email,
    bio
  })
    .then(() => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
