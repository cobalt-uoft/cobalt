var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* User imports **/
var User = require('./models/user');

/* Page imports */
var index = require('./routes/index')
var login = require('./routes/login')
var logout = require('./routes/logout')
var signup = require('./routes/signup')
var dashboard = require('./routes/dashboard')
var docs = require('./routes/docs')

/* Courses imports */
var courses = {
  show: require('./api/courses/routes/show'),
  search: require('./api/courses/routes/search'),
  filter: require('./api/courses/routes/filter')
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('api version', '1.0')

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: 'pusheeeen',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

// passport config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGOLAB_URL)

app.use('/', index)
app.use('/login', login)
app.use('/logout', logout)
app.use('/signup', signup)
app.use('/dashboard', dashboard)
app.use('/docs', docs)

app.use('/api/courses/show', courses.show)
app.use('/api/courses/search', courses.search)
app.use('/api/courses/filter', courses.filter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
