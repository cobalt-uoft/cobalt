var express = require('express')
var Courses = require('../../schemas/courses')
var router = express.Router()

var limit = 10

router.get('/', function(req, res) {

  if(req.query.q) {

    var qLimit = limit
    if(req.query.limit && req.query.limit < 100) {
      qLimit = req.query.limit
    }

    Courses.find({
      $text: {
        $search: req.query.q
      }
    }).limit(qLimit).exec(function(err, docs) {
      res.json(docs)
    })

  }

})

module.exports = router
