import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
import search from './routes/search'

router.get('/list', list)
router.get('/show/:id', show)
router.get('/search', search)

export default router
