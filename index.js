import express from 'express'
import mongoose from 'mongoose'
import courses from './api/courses'
import buildings from './api/buildings'

/* Express setup */
let app = express()

/* Mongoose setup */
if (!process.env.COBALT_MONGO_URL) {
  throw new Error('Missing COBALT_MONGO_URL environment variable')
}

mongoose.connect(process.env.COBALT_MONGO_URL, err => {
  if (err) {
    throw new Error(`Failed to connect to MongoDB [COBALT_MONGO_URL=${process.env.COBALT_MONGO_URL}]: ${err.message}`)
  } else {
    console.log(`Connected to MongoDB`)
  }
})

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

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    code: err.status,
    message: err.message
  })
})

export default app
