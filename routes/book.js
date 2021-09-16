'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const Book = require('../models/book');
const routeGuard = require('./../middleware/route-guard');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2
});
const upload = multer({ storage });

const bookRouter = express.Router();

// to get to the page to search for books
bookRouter.get('/search-book', routeGuard, (req, res, next) => {
  res.render('search-book');
});

// to display results yielded from search
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
bookRouter.get('/booklist/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Book.find({})
    .populate('creator')
    .then((books) => {
      res.render('user-book-list', { books });
      console.log(books);
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
    const { title, subtitle, image, bookList } = req.body;
    Book.create({
      title,
      subtitle,
      image,
      bookList: `booklist/${id}`,
      creator: id
    })
      .then((books) => {
        res.redirect(`/booklist/${id}`);
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
  const { review, bookList } = req.body;
  Book.findByIdAndUpdate(id, { review, bookList })
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
  const bookList = req.body.bookList;
  Book.findByIdAndDelete(id)
    .then(() => {
      res.redirect(`/booklist/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = bookRouter;
