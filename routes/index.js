var express = require('express')
var router = express.Router()

router.get('/', function(req, res) {
  res.render('pages/index', { user: req.user, build: '0.0a11' })
})

module.exports = router
