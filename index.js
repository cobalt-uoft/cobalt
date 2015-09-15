import express from 'express'
import mongoose from 'mongoose'
import errorhandler from 'errorhandler'
import courses from './api/courses'
import buildings from './api/buildings'

/* Express setup */
let app = express()

/* Mongoose setup */
if (!process.env.MONGO_URL) {
  throw new Error('Missing MONGO_URL environment variable')
}

mongoose.connect(process.env.MONGO_URL, err => {
  if (err) {
    throw new Error(`Failed to connect to MongoDB [MONGO_URL=${process.env.MONGO_URL}]: ${err.message}`)
  } else {
    console.log(`Connected to MongoDB [MONGO_URL=${process.env.MONGO_URL}]`)
  }
})

/* API routes */
let apiVersion = '1.0'
app.use(`/api/${apiVersion}/courses`, courses)
app.use(`/api/${apiVersion}/buildings`, buildings)

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
