import express from 'express'
let router = express.Router()

import list from './routes/list'
import show from './routes/show'
// import filter from './routes/filter'

import Validator from '../../utils/validator'

router.get('/',
  Validator.limit,
  Validator.skip,
  Validator.sort,
  list)

/*
router.get('/filter',
  Validator.query,
  Validator.limit,
  Validator.skip,
  Validator.sort,
  filter)
*/

router.get('/:date',
  Validator.date,
  show)

export default router
