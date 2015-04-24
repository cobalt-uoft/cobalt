import express from 'express'
let router = express.Router()

router.get('/', (req, res) => {
  res.render('pages/docs', { user: req.user })
})

export default router
