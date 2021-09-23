'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const Review = require('../models/review');
const Comment = require('../models/comment');
const routeGuard = require('./../middleware/route-guard');

const commentRouter = express.Router();

commentRouter.get(
  '/bookList/:listId/:title/:id/comments',
  routeGuard,
  (req, res, next) => {
    res.render('comment-add');
  }
);
// to render a comment
commentRouter.get('/book/:bookId/comments', routeGuard, (req, res, next) => {
  //const id = req.params.id;
  const bookId = req.params.bookId;
  //let book;
  Comment.find({ book: bookId })
    .populate('book')
    .populate('creator')
    .then((comments) => {
      console.log(comments);
      res.render('comment-add', {
        comments,
        title: comments[0].book.title
      });
    })
    .catch((error) => {
      next(error);
    });
});

// to create the book comment on a review

commentRouter.post('/book/:bookId/comments', routeGuard, (req, res, next) => {
  const { id, listId, bookId } = req.params;
  const message = req.body.message;
  Comment.create({
    book: bookId,
    message,
    creator: req.user._id
  })
    .then(() => {
      res.redirect(`/book/${bookId}/comments`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = commentRouter;
