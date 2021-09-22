'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const Review = require('../models/review');
const Comment = require('../models/comment');
const routeGuard = require('./../middleware/route-guard');

const commentRouter = express.Router();

commentRouter.get(
  '/bookList/:listId/:title/:id/addcomment',
  routeGuard,
  (req, res, next) => {
    res.render('comment-add');
  }
);
// to create a comment
commentRouter.get(
  '/bookList/:listId/:title/:id/addcomment',
  routeGuard,
  (req, res, next) => {
    const id = req.params.id;
    let book;
    Book.findById(id)

      .then((document) => {
        book = document;
        return Comment.find({ book: id });
      })
      .then((comments) => {
        res.render('user-book-list', {
          book,
          comments
        });
      })
      .catch((error) => {
        next(error);
      });
  }
);
// to create the book comment on a review

commentRouter.post(
  '/bookList/:listId/:title/:id/addcomment',
  routeGuard,
  (req, res, next) => {
    const { id, listId } = req.params;
    const message = req.body.message;
    Comment.create({
      book: id,
      message,
      creator: req.user._id
    })
      .then(() => {
        res.redirect(`/booklist/${listId}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = commentRouter;
