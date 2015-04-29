import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
import search from './routes/search'
import filter from './routes/filter'

router.get('/:year/list', list)
router.get('/:year/show/:id', show)
router.get('/:year/search', search)
router.get('/:year/filter', filter)

export default router
