'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const Book = require('../models/book');
// const User = require('../models/user');
const routeGuard = require('./../middleware/route-guard');

const bookRouter = express.Router();

bookRouter.get('/search-book', routeGuard, (req, res, next) => {
  res.render('search-book');
});

bookRouter.get('/results', routeGuard, (req, res) => {
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

bookRouter.get('/booklist/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.find({})
    .then((books) => {
      res.render('user-book-list', { books });
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/results', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { title, subtitle, image } = req.body;
  Book.create({
    title,
    subtitle,
    image
  })
    .then(() => {
      res.redirect(`/booklist/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.get('/booklist/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.findById(id)
    .then((book) => {
      res.render('review-add', { book });
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/booklist/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const review = req.body.review;
  Book.findByIdAndUpdate(id, { title, subtitle, review })
    .then(() => {
      res.redirect(`/booklist/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});

bookRouter.post('/booklist/:id/delete', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  Book.findByIdAndDelete(id)
    .then(() => {
      res.redirect(`/booklist/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = bookRouter;
