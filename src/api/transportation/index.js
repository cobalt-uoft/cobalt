import express from 'express'
let router = express.Router()

import parking from './parking'
import shuttles from './shuttles'

router.use('/parking', parking)
router.use('/shuttles', shuttles)

export default router
