'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const Review = require('../models/review');
const Comment = require('../models/comment');
const routeGuard = require('./../middleware/route-guard');

const commentRouter = express.Router();

commentRouter.get('/bookList/:id/addcomment', routeGuard, (req, res, next) => {
  res.render('comment-add');
});
// to create a comment
commentRouter.get('/bookList/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let review;
  Review.findById(id)

    .then((document) => {
      review = document;
      return Comment.find({ review: id });
    })
    .then((comments) => {
      res.render('/user-book-list', {
        review,
        comments
      });
    })
    .catch((error) => {
      next(error);
    });
});
// to create the book comment on a review

commentRouter.post('/bookList/:id/addcomment', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const message = req.body.message;
  Comment.create({
    review: id,
    message,
    creator: req.user._id
  })
    .then(() => {
      res.redirect(`/booklist/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = commentRouter;
