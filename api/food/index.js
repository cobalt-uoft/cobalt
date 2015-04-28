var express = require('express')
var router = express.Router()

router.get('/list', require('./routes/list') )
router.get('/show/:id', require('./routes/show') )
router.get('/search', require('./routes/search') )

module.exports = router
