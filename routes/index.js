'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const Book = require('../models/book');
const User = require('../models/user');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

router.get('/profile/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((profile) => {
      res.render('profile');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/edit-profile/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((profile) => {
      res.render('edit-profile');
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/edit-profile/:id', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { name, email, bio } = req.body;
  User.findByIdAndUpdate(id, { name, email, bio })
    .then(() => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
