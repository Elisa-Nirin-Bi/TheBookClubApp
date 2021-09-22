'use strict';

const express = require('express');
const listRouter = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const List = require('../models/list');
const routeGuard = require('../middleware/route-guard');
const upload = require('../middleware/file-upload');

// to create new model for lists? to rework the below and create-list.hbs

listRouter.get('/create-list', routeGuard, (req, res, next) => {
  res.render('create-list', { list: true });
});

listRouter.post('/create-list', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { listName } = req.body;
  List.findOne({ listName }, { listName })
    .then((listExists) => {
      if (listExists) {
        console.log('list name already exists: ', listName);
        throw new Error('LIST_NAME_ALREADY_EXISTS');
      } else {
        List.create({
          listName,
          listCreator: id
        }).then(() => {
          res.redirect(`/profile/${id}`);
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = listRouter;
