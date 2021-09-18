'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const routeGuard = require('./../middleware/route-guard');

const commentRouter = express.Router();

// to get to page to add a comment
commentRouter.get('/bookList/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.findById(id)
    .then((book) => {
      res.render('comment-add', { book });
    })
    .catch((error) => {
      next(error);
    });
});

// to create the book comment on a review
commentRouter.post('/bookList/:id/addcomment', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  const { review, bookList } = req.body;
  Book.findByIdAndUpdate(id, { review, bookList })
    .then(() => {
      res.redirect(`/booklist/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = commentRouter;
