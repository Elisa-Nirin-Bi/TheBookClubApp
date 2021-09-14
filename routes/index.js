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

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
