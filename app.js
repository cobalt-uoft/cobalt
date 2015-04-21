var express = require('express')
var session = require('express-session')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var flash = require('connect-flash')

/* Express setup */
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
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//Initialize mongoose singleton
mongoose.connect(process.env.MONGO_URL)

/* Front end routes */
app.use('/', require('./routes/index') )
app.use('/docs', require('./routes/docs') )

/* User routes */
app.use('/user', require('user') )

/* API routes */
app.use('/api/courses', require('uoft-course-api') )
app.use('/api/buildings', require('uoft-building-api') )
app.use('/api/food', require('uoft-food-api') )


/* Error handlers */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.json({
      "error": {
        code: err.status,
        message: err.message
      }
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
