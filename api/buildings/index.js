import express from 'express'
import mongoose from 'mongoose'
let router = express.Router()

mongoose.connect(process.env.MONGO_URL)

import list from './routes/list'
import show from './routes/show'
import search from './routes/show'

router.get('/list', list)
router.get('/show/:id', show)
router.get('/search', search)

export default router