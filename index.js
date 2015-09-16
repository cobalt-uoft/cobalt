import express from 'express'
import mongoose from 'mongoose'
import scraper from './scraper'
import courses from './api/courses'
import buildings from './api/buildings'
import errorhandler from 'errorhandler'

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

/* Scraper setup */
console.log('scrape time bb')
scraper()

/* API routes */
let apiVersion = '1.0'
app.use(`/${apiVersion}/courses`, courses)
app.use(`/${apiVersion}/buildings`, buildings)

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
  res.json({
    code: err.status,
    message: err.message
  })
})

export default app
