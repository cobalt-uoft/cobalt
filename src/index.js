import express from 'express'
import mongoose from 'mongoose'
import winston from 'winston'
import db from './db'

import athletics from './api/athletics'
import buildings from './api/buildings'
import courses from './api/courses'
import exams from './api/exams'
import food from './api/food'
import textbooks from './api/textbooks'
import transportation from './api/transportation'
import cdf from './api/cdf'

let test = process.argv.join().match('/ava/')
let enableSync = process.env.COBALT_ENABLE_DB_SYNC || 'true'

// Database connection setup
mongoose.connect(process.env.COBALT_MONGO_URI || 'mongodb://localhost/cobalt', err => {
  if (err) throw new Error(`Failed to connect to MongoDB [${process.env.COBALT_MONGO_URI}]: ${err.message}`)
  if (!test) {
    winston.info('Connected to MongoDB')
  }
})

// Express setup
let app = express()

// Database sync keeper
if (!test && enableSync == 'true') {
  db.syncCron()
}

// API routes
let apiVersion = '1.0'
app.use(`/${apiVersion}/athletics`, athletics)
app.use(`/${apiVersion}/buildings`, buildings)
app.use(`/${apiVersion}/courses`, courses)
app.use(`/${apiVersion}/exams`, exams)
app.use(`/${apiVersion}/food`, food)
app.use(`/${apiVersion}/textbooks`, textbooks)
app.use(`/${apiVersion}/transportation`, transportation)
app.use(`/${apiVersion}/cdf`, cdf)

// Error handlers
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  err.status = err.status || 500
  res.status(err.status)
  let error = {
    code: err.status,
    message: err.message
  }
  res.json({
    error: error
  })
})

module.exports = {
  Server: app
}
