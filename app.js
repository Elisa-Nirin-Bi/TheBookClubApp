'use strict';

const path = require('path');
const express = require('express');
const hbs = require('hbs');
const createError = require('http-errors');
const connectMongo = require('connect-mongo');
const expressSession = require('express-session');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const basicAuthenticationDeserializer = require('./middleware/basic-authentication-deserializer.js');
const bindUserToViewLocals = require('./middleware/bind-user-to-view-locals.js');
const bookRouter = require('./routes/book');
const commentRouter = require('./routes/comment');
const listRouter = require('./routes/list');
const baseRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const app = express();

hbs.registerHelper('date', (value) => {
  return `${value.toLocaleDateString()}, ${value.toLocaleTimeString()}`;
});

hbs.registerPartials(path.join(__dirname, 'views/partials'));

hbs.registerHelper('select', (selected, options) => {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: path.join('styles'),
    dest: path.join(__dirname, 'public/styles'),
    prefix: '/styles',
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: process.env.NODE_ENV === 'development'
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    store: connectMongo.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60
    })
  })
);
app.use(basicAuthenticationDeserializer);
app.use(bindUserToViewLocals);

app.use('/', baseRouter);
app.use('/', bookRouter);
app.use('/', listRouter);
app.use('/', commentRouter);
app.use('/authentication', authenticationRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development

  // if (Error.type == 'e-mail not found') res.render('error-no-user');
  // else (res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  console.log(error);
  res.status(error.status || 500);
  res.render('error', { error: error });
});

module.exports = app;
