var express = require('express')
var router = express.Router()

router.get('/:year/list', require('./routes/list') )
router.get('/:year/show/:id', require('./routes/show') )
router.get('/:year/search', require('./routes/search') )
router.get('/:year/filter', require('./routes/filter') )

module.exports = router
