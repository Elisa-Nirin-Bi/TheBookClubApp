'use strict';

const express = require('express');
const listRouter = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const List = require('../models/list');
const routeGuard = require('../middleware/route-guard');
const upload = require('../middleware/file-upload');

listRouter.get('/create-list', routeGuard, (req, res, next) => {
  List.find({ listCreator: req.user._id })
    .then((lists) => {
      res.render('create-list', { lists, list: true });
    })
    .catch((error) => {
      next(error);
    });
});

listRouter.post('/create-list', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { listName } = req.body;
  let booksOnList;
  List.findOne({ listName, listCreator: id })
    .then((listExists) => {
      if (listExists) {
        console.log('list name already exists: ', listName);
        throw new Error('LIST_NAME_ALREADY_EXISTS');
      }
    })
    .then(() => {
      List.create({
        listName,
        listCreator: id,
        booksOnList
      });
    })
    .then(() => {
      // res.redirect(`/profile/${id}`);
      res.redirect('/create-list');
    })
    .catch((error) => {
      next(error);
    });
});

// to delete a list
listRouter.post('/bookList/:listId/delete', routeGuard, (req, res, next) => {
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

module.exports = listRouter;
