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

// to get to the page to search for books to add to a particular book list
bookRouter.get(
  '/search-book/booklist/:bookListId',
  routeGuard,
  (req, res, next) => {
    const bookListId = req.params.bookListId;
    res.render('search-book', { searchBook: true, bookListId });
  }
);

// to display results yielded from search
bookRouter.get('/results', routeGuard, (req, res) => {
  const topic = req.query.topic;
  let userLists;
  if (topic) {
    return List.find({ listCreator: req.user._id })
      .then((doc) => {
        userLists = doc;
        axios
          .get(`https://www.googleapis.com/books/v1/volumes?q=${topic}`)
          .then((resp) => {
            console.log(userLists);
            const books = resp.data.items;
            res.render('results', {
              books: { books, userLists }
            });
          });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    throw new Error('MUST_HAVE_SEARCH_INPUT');
  }
});

// to display books added to a book list
bookRouter.get('/booklist/:bookListId', routeGuard, (req, res, next) => {
  const bookListId = req.params.bookListId;
  let bookListPage;
  return List.findById(bookListId)
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
    const topic = req.query.topic;
    let bookListId;
    return List.findOne(
      { listName: bookList, listCreator: id },
      { listName: 1 }
    )
      .populate('booksOnList')
      .then((list) => {
        if (!list) {
          axios
            .get(`https://www.googleapis.com/books/v1/volumes?q=${topic}`)
            .then((resp) => {
              res.render('results', {
                books: resp.data.items,
                listNonExistant: true
              });
            });
          // throw new Error('LIST_DOES_NOT_EXIST');
        } else {
          bookListId = list.id;
          return Book.findOne({ bookList: bookListId, title, creator: id })
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
            });
        }
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
    let currentBookList;
    Book.findById(id)
      .populate('bookList')
      .then((book) => {
        if (String(req.user._id) === String(book.creator)) {
          currentBookList = book.bookList.listName;
          res.render('review-add', { book, currentBookList });
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);
// to get to page to move to new list
bookRouter.get(
  '/bookList/:listId/:title/:id/edit-list',
  routeGuard,
  (req, res, next) => {
    const id = req.params.id;
    const userId = req.user._id;
    let currentBookList;
    let bookLists;
    return List.find({ listCreator: userId })
      .then((doc) => {
        bookLists = doc;
      })
      .then(() => {
        return Book.findById(id).populate('bookList');
      })
      .then((book) => {
        if (String(req.user._id) === String(book.creator)) {
          currentBookList = book.bookList.listName;
          console.log(currentBookList);
          res.render('move-to-new-list', { book, bookLists, currentBookList });
        } else {
          throw new Error('UNAUTHORIZED_USER');
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

// to move book to new list
bookRouter.post(
  '/bookList/:listId/:title/:id/edit-list',
  routeGuard,
  (req, res, next) => {
    const listId = req.params.listId;
    const id = req.params.id;
    let booksOnList;
    const { bookList } = req.body;
    return List.findOne({ listName: bookList, listCreator: req.user._id })
      .then((newExistingList) => {
        if (!newExistingList) {
          return List.create({
            listName: bookList,
            listCreator: req.user._id,
            booksOnList
          }).then((newList) => {
            return Book.findByIdAndUpdate(id, { bookList: newList });
          });
        } else {
          return Book.findByIdAndUpdate(id, {
            bookList: newExistingList
          });
        }
      })
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

// to create the book review
bookRouter.post(
  '/bookList/:listId/:title/:id/edit',
  routeGuard,
  (req, res, next) => {
    const listId = req.params.listId;
    const id = req.params.id;
    const { review } = req.body;
    return Book.findByIdAndUpdate(id, {
      review
    })
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
