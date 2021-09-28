'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const Review = require('../models/review');
const Comment = require('../models/comment');
const routeGuard = require('./../middleware/route-guard');

const commentRouter = express.Router();

// to render comment page, for viewing, adding, deleting comments
commentRouter.get('/book/:bookId/comments', routeGuard, (req, res, next) => {
  const bookId = req.params.bookId;
  let bookTitle;
  return Book.findById(bookId)
    .then((book) => {
      bookTitle = book.title;
      return Comment.find({ book: bookId }).populate('creator');
    })
    .then((comments) => {
      res.render('comment-add', {
        comments,
        title: bookTitle
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
  Book.findById(bookId)
    .then((book) => {
      return Comment.create({
        book,
        message,
        creator: req.user._id
      });
    })
    .then((comment) => {
      console.log(comment);
      res.redirect(`/book/${bookId}/comments`);
    })
    .catch((error) => {
      next(error);
    });
});

/* Previous comment code
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
*/

//to like a comment

commentRouter.post('/book/:id/vote', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndUpdate(id, { $inc: { score: 1 } })
    .then((comment) => {
      console.log(comment);
      const bookId = comment.book;
      res.redirect(`/book/${bookId}/comments`);
    })
    .catch((error) => {
      next(error);
    });
});

commentRouter.post('/book/:id/dislike', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndUpdate(id, { $inc: { unlike: 1 } })
    .then((comment) => {
      console.log(comment);
      const bookId = comment.book;
      res.redirect(`/book/${bookId}/comments`);
    })
    .catch((error) => {
      next(error);
    });
});

commentRouter.get(
  '/book/:commentId/comments/edit',
  routeGuard,
  (req, res, next) => {
    res.render('comment-edit');
  }
);
commentRouter.post(
  '/book/:commentId/comments/edit',
  routeGuard,
  (req, res, next) => {
    const commentId = req.params.commentId;
    const { message } = req.body;
    Comment.findById({ _id: commentId, creator: req.user._id })
      .then((comment) => {
        if (String(req.user._id) === String(comment.creator)) {
          return Comment.findByIdAndUpdate(
            { _id: commentId, creator: req.user._id },
            { message }
          ).then(() => {
            const bookId = comment.book;
            res.redirect(`/book/${bookId}/comments`);
          });
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);
/*commentRouter.post(
  '/book/:commentId/comments/edit',
  routeGuard,
  (req, res, next) => {
    const commentId = req.params.commentId;
    const { message } = req.body;
    Comment.findByIdAndUpdate(
      { _id: commentId, creator: req.user._id },
      { message }
    )
      .then((comment) => {
        if (String(req.user._id) === String(comment.creator)) {
          const bookId = comment.book;
          res.redirect(`/book/${bookId}/comments`);
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);*/

commentRouter.post(
  '/book/:commentId/comments/delete',
  routeGuard,
  (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findById({ _id: commentId, creator: req.user._id })
      .then((comment) => {
        if (String(req.user._id) === String(comment.creator)) {
          return Comment.findByIdAndDelete({
            _id: commentId,
            creator: req.user._id
          }).then(() => {
            const bookId = comment.book;
            res.redirect(`/book/${bookId}/comments`);
          });
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

/*commentRouter.post(
  '/book/:commentId/comments/delete',
  routeGuard,
  (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findByIdAndDelete({ _id: commentId, creator: req.user._id })

      .then((comment) => {
        if (comment) {
          console.log(commentId);
          const bookId = comment.book;
          res.redirect(`/book/${bookId}/comments`);
        } else {
          console.log(commentId);
          throw new Error('NOT_ALLOWED_TO_DELETE_PUBLICATION');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);*/

module.exports = commentRouter;
