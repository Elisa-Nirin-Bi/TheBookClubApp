'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

router.get('/search-book', routeGuard, (req, res, next) => {
  res.render('search-book');
});

router.get('/results', (req, res) => {
  const topic = req.query.topic;
  axios
    .get(`https://api.itbook.store/1.0/search/${topic}`)
    .then((resp) => {
      res.render('results', {
        books: resp.data.books
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
