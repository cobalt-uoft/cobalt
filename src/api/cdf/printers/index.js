import express from 'express'
let router = express.Router()

import list from './routes/list'
router.get('/', list)

export default router
