import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
import search from './routes/search'
import filter from './routes/filter'

router.get('/list', list)
router.get('/show/:id', show)
router.get('/search', search)
router.get('/filter', filter)

export default router
