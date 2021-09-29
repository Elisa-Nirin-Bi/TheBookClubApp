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

// to display books added to a book list
bookRouter.get('/booklist/:bookListId', routeGuard, (req, res, next) => {
  const bookListId = req.params.bookListId;
  let bookListPage;
  List.findById(bookListId)
    .then((list) => {
      bookListPage = list;
      return Book.find({
        // creator: req.user._id,
        bookList: bookListId
      }).populate('creator');
    })
    .then((books) => {
      console.log(req.user._id, bookListPage.listCreator);
      if (String(req.user._id) === String(bookListPage.listCreator)) {
        res.render('user-book-list', {
          books,
          bookListPage,
          authorizedUser: true
        });
      } else {
        res.render('user-book-list', {
          books,
          bookListPage,
          authorizedUser: false
        });
      }
    })

    .catch((error) => {
      next(error);
    });
});

// to create books from search results, added to a book list
bookRouter.post(
  '/results',
  routeGuard,
  upload.single('image'),
  (req, res, next) => {
    const id = req.user._id;
    const { title, authors, publisher, image, bookList } = req.body;
    let bookListId;
    return List.findOne(
      { listName: bookList, listCreator: id },
      { listName: 1 }
    )
      .populate('booksOnList')
      .then((list) => {
        bookListId = list.id;
        return Book.findOne({ bookList: bookListId, title, creator: id });
      })
      .then((bookExists) => {
        if (bookExists) {
          throw new Error('BOOK_ALREADY_EXISTS');
        }
        return Book.create({
          title,
          authors,
          publisher,
          image,
          bookList: bookListId,
          creator: id
        });
      })
      .then((book) => {
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
        if (String(req.user._id) === String(book.creator)) {
          res.render('review-add', { book });
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
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
    return Book.findByIdAndUpdate(id, { review })
      .then((book) => {
        if (String(req.user._id) === String(book.creator)) {
          res.redirect(`/booklist/${listId}`);
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to delete a book from a list
bookRouter.post(
  '/bookList/:listId/:title/:id/delete',
  routeGuard,
  (req, res, next) => {
    const { listId, id } = req.params;
    return Book.findById(id)
      .then((book) => {
        if (String(req.user._id) === String(book.creator)) {
          Book.findByIdAndDelete(id).then(() => {
            res.redirect(`/booklist/${listId}`);
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

module.exports = bookRouter;
