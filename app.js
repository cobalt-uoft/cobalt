import express from 'express'
import session from 'express-session'
import errorhandler from 'errorhandler'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import passport from 'passport'
import flash from 'connect-flash'

/* Express setup */
let app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('api version', '1.0')

app.use(favicon(path.join(__dirname, 'public/favicon.ico')))
app.use(logger('short'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
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

// Initialize mongoose singleton
if (!process.env.MONGO_URL) {
  throw new Error('Missing MONGO_URL environment variable')
}
mongoose.connect(process.env.MONGO_URL, err => {
  if (err) {
    throw new Error(`Failed to connect to MongoDB [MONGO_URL=${process.env.MONGO_URL}]: ${err.message}`)
  } else {
    console.log('Connected to MongoDB')
  }
})

/* Front end routes */
import index from './routes/index'
import docs from './routes/docs'
app.use('/', index)
app.use('/docs', docs)

/* User routes */
import user from 'user'
app.use('/user', user)

/* API routes */
import uoftCourseApi from 'uoft-course-api'
import uoftBuildingApi from 'uoft-building-api'
import uoftFoodApi from 'uoft-food-api'
let apiVersion = app.get('api version')
app.use(`/api/${apiVersion}/courses`, uoftCourseApi)
app.use(`/api/${apiVersion}/buildings`, uoftBuildingApi)
app.use(`/api/${apiVersion}/food`, uoftFoodApi)

/* Error handlers */

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorhandler())
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

export default app
