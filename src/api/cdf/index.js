import express from 'express'
let router = express.Router()

import labs from './labs'
import printers from './printers'

router.use('/labs', labs)
router.use('/printers', printers)

export default router
