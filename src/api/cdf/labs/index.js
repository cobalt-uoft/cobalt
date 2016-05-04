import express from 'express'
let router = express.Router()

import list from './routes/list'

import Validator from '../../utils/validator'

router.get('/', list)

export default router
