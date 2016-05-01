import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
import search from './routes/search'
import filter from './routes/filter'

import Validator from '../utils/validator'

router.get('/',
  Validator.limit,
  Validator.skip,
  Validator.sort,
  list)

router.get('/search',
  Validator.query,
  Validator.limit,
  Validator.skip,
  Validator.sort,
  search)

router.get('/filter',
  Validator.query,
  Validator.limit,
  Validator.skip,
  Validator.sort,
  filter)

router.get('/:id',
  Validator.id,
  show)

export default router
