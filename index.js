import express from 'express'
import mongoose from 'mongoose'
import winston from 'winston'
import courses from './api/courses'
import buildings from './api/buildings'

// Database connection setup
mongoose.connect(process.env.COBALT_MONGO_URI || 'mongodb://localhost/cobalt', err => {
  if (err) throw new Error(`Failed to connect to MongoDB [${process.env.COBALT_MONGO_URI}]: ${err.message}`)
  winston.debug('Connected to MongoDB')
})

// Express setup
let app = express()

// API routes
let apiVersion = '1.0'
app.use(`/${apiVersion}/courses`, courses)
app.use(`/${apiVersion}/buildings`, buildings)

// Error handlers
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    error: {
      code: err.status,
      message: err.message
    }
  })
})

export default app
