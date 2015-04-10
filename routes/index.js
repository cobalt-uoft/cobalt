var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/index', { user: req.user, build: '0.0a5' })
})

module.exports = router
