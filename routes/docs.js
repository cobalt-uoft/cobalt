import express from 'express'
let router = express.Router()

router.get('/', (req, res) => {
  res.render('pages/docs', {
    user: req.user,
    selfHosted: process.env.SELF_HOSTED
  })
})

export default router
