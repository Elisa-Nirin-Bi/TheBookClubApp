'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const Book = require('../models/book');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
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

router.get('/private', (req, res, next) => {
  Book.find({})
    .then((books) => {
      res.render('private', { books });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/results', (req, res, next) => {
  const { title, subtitle, image } = req.body;
  Book.create({
    title,
    subtitle,
    image
  })
    .then(() => {
      res.redirect('private');
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/private/:id/delete', (req, res, next) => {
  const id = req.params.id;
  Book.findOneAndDelete({ id })
    .then((publication) => {
      if (publication) {
        res.redirect('/private');
      } else {
        throw new Error('NOT_ALLOWED_TO_DELETE_PUBLICATION');
      }
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = router;
