import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
// import filter from './routes/filter'

import validation from '../../utils/validation'

router.get('/',
  validation.limit,
  validation.skip,
  validation.sort,
  list)

/*
router.get('/filter',
  validation.query,
  validation.filterQuery,
  validation.limit,
  validation.skip,
  validation.sort,
  filter)
*/

router.get('/:date',
  validation.date,
  show)

export default router
