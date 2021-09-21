'use strict';

const express = require('express');
const axios = require('axios');
const Book = require('../models/book');
const List = require('../models/list');
const routeGuard = require('./../middleware/route-guard');
const upload = require('./../middleware/file-upload');

const bookRouter = express.Router();

// to get to the page to search for books
bookRouter.get('/search-book', routeGuard, (req, res, next) => {
  res.render('search-book', { searchBook: true });
});

// to display results yielded from search
bookRouter.get('/results', routeGuard, (req, res) => {
  const topic = req.query.topic;
  const userLists = req.user.userLists;
  console.log(userLists);
  axios
    .get(`https://www.googleapis.com/books/v1/volumes?q=${topic}`)
    .then((resp) => {
      res.render('results', {
        books: resp.data.items,
        userLists
      });
      console.log(resp.data.items);
    })
    .catch((error) => {
      console.log(error);
    });
});

/*
// to display books added to other book lists
bookRouter.get('/booklist/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.find({bookList})
    .then((books) => {
      res.render('user-book-list', { books });
    })
    .catch((error) => {
      next(error);
    });
});
*/

// to display books added to main book list
bookRouter.get('/booklist/:listName', routeGuard, (req, res, next) => {
  const listName = req.params.listName;
  console.log(listName);
  Book.find({ creator: req.user._id })
    .populate('creator')
    // .populate('bookList')
    .then((books) => {
      res.render('user-book-list', { books, listName });
      // console.log(books);
    })
    .catch((error) => {
      next(error);
    });
});

// to create books from search results to main book list
bookRouter.post(
  '/results',
  routeGuard,
  upload.single('image'),
  (req, res, next) => {
    const id = req.user._id;
    const { title, authors, publisher, image, bookList } = req.body;
    // let bookList = 'poop';
    Book.create({
      title,
      authors,
      publisher,
      image,
      bookList,
      creator: id
    })
      .then((book) => {
        res.redirect(`/booklist/${bookList}`);
        // res.redirect(`/booklist/${bookList}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to get to page to add a review
bookRouter.get('/bookList/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.findById(id)
    .then((book) => {
      res.render('review-add', { book });
    })
    .catch((error) => {
      next(error);
    });
});

// to create the book review
bookRouter.post('/bookList/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  const { review } = req.body;
  Book.findByIdAndUpdate(id, { review })
    .then(() => {
      res.redirect(`/booklist/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});

// to delete a book from main book list
bookRouter.post('/bookList/:id/delete', routeGuard, (req, res, next) => {
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
