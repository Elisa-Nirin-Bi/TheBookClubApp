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
  res.render('create-list');
});

listRouter.post('/create-list', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { listName } = req.body;
  List.create({
    listName,
    listCreator: id
  })
    .then((lists) => {
      res.redirect(`/profile/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = listRouter;
