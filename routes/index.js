import express from 'express'
let router = express.Router()

router.get('/', (req, res) => {
  res.render('pages/index', { user: req.user, build: '0.0a12' })
})

export default router
