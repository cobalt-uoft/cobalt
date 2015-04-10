var express = require('express')
var session = require('express-session')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

/* Front end imports */
var index = require('./routes/index')
var docs = require('./routes/docs')

/* Course API imports */
var courses = {
  list: require('./api/uoft-course-api/routes/list'),
  show: require('./api/uoft-course-api/routes/show'),
  search: require('./api/uoft-course-api/routes/search'),
  filter: require('./api/uoft-course-api/routes/filter')
}

/* Building API imports */
var buildings = {
  list: require('./api/uoft-building-api/routes/list'),
  show: require('./api/uoft-building-api/routes/show'),
  search: require('./api/uoft-building-api/routes/search')
}

/* Food API imports */
var foods = {
  list: require('./api/uoft-food-api/routes/list'),
  show: require('./api/uoft-food-api/routes/show'),
  search: require('./api/uoft-food-api/routes/search')
}

/* User imports */
var User = require('./user/model')
var user = {
  login: require('./user/routes/login'),
  logout: require('./user/routes/logout'),
  signup: require('./user/routes/signup'),
  dashboard: require('./user/routes/dashboard')
}

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('api version', '1.0')

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser())
app.use(session({
  secret: 'pusheeeen',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())

//Initialize mongoose singleton
mongoose.connect(process.env.MONGOLAB_URL)


/* Passport plugins */
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.login(email, password, function(err, user) {
      if(err) {
        return done(null, false, { message: err.message })
      }
      return done(null, user)
    })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

/* Front end routes */
app.use('/', index)
app.use('/docs', docs)

/* User routes */
app.use('/login', user.login)
app.use('/logout', user.logout)
app.use('/signup', user.signup)
app.use('/dashboard', user.dashboard)

/* Course API routes */
app.use('/api/courses', courses.list)
app.use('/api/courses/show', courses.show)
app.use('/api/courses/search', courses.search)
app.use('/api/courses/filter', courses.filter)

/* Building API routes */
app.use('/api/buildings', buildings.list)
app.use('/api/buildings/show', buildings.show)
app.use('/api/buildings/search', buildings.search)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})


module.exports = app
