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
  axios
    .get(`https://www.googleapis.com/books/v1/volumes?q=${topic}`)
    .then((resp) => {
      res.render('results', {
        books: resp.data.items,
        userLists
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// to display books added to main book list
bookRouter.get('/booklist/:bookListId', routeGuard, (req, res, next) => {
  const bookListId = req.params.bookListId;
  let bookListPage;
  List.findById(bookListId)
    .then((list) => {
      bookListPage = list;
      return Book.find({
        creator: req.user._id,
        bookList: bookListId
      }).populate('creator');
    })
    .then((books) => {
      res.render('user-book-list', { books, bookListPage });
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
    let bookListId;
    return List.findOne({ listName: bookList }, { listName: 1 })
      .then((list) => {
        const listId = list.id;
        return Book.create({
          title,
          authors,
          publisher,
          image,
          bookList: listId,
          creator: id
        });
      })
      .then((book) => {
        bookListId = book.bookList;
        return List.findByIdAndUpdate(bookListId, { booksOnList: book });
      })
      .then((list) => {
        res.redirect(`/booklist/${bookListId}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to get to page to add a review
bookRouter.get(
  '/bookList/:listId/:title/:id/edit',
  routeGuard,
  (req, res, next) => {
    const id = req.params.id;
    Book.findById(id)
      .then((book) => {
        res.render('review-add', { book });
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to create the book review
bookRouter.post(
  '/bookList/:listId/:title/:id/edit',
  routeGuard,
  (req, res, next) => {
    const listId = req.params.listId;
    const id = req.params.id;
    const { review } = req.body;
    Book.findByIdAndUpdate(id, { review })
      .then(() => {
        res.redirect(`/booklist/${listId}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to delete a book from main book list
bookRouter.post(
  '/bookList/:listId/:title/:id/delete',
  routeGuard,
  (req, res, next) => {
    const { listId, id } = req.params;
    Book.findByIdAndDelete(id)
      .then(() => {
        res.redirect(`/booklist/${listId}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

bookRouter.post('/bookList/:listId/delete', routeGuard, (req, res, next) => {
  const { listId } = req.params;
  const userId = req.user._id;
  return Book.deleteMany({ bookList: listId })
    .then((book) => {
      return List.findByIdAndDelete(listId);
    })
    .then(() => {
      res.redirect(`/profile/${userId}`);
    })
    .catch((error) => {
      next(error);
    });
});
module.exports = bookRouter;
