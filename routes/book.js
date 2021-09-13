'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const Book = require('../models/book');
const routeGuard = require('./../middleware/route-guard');

const bookRouter = express.Router();

bookRouter.get('/search-book', routeGuard, (req, res, next) => {
  res.render('search-book');
});

bookRouter.get('/results', (req, res) => {
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

bookRouter.get('/private', (req, res, next) => {
  Book.find({})
    .then((books) => {
      res.render('private', { books });
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/results', (req, res, next) => {
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

bookRouter.get('/private/:id/edit', (req, res, next) => {
  const id = req.params.id;
  Book.findById(id)
    .then((book) => {
      res.render('review-add', { book });
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/private/:id/edit', (req, res, next) => {
  const id = req.params.id;
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const review = req.body.review;
  Book.findOneAndUpdate(id, { title, subtitle, review })
    .then(() => {
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/private/:id/delete', (req, res, next) => {
  const id = req.params.id;
  Book.findOneAndDelete({ id })
    .then(() => {
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = bookRouter;
