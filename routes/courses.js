var express = require('express')
var router = express.Router()

var QUERIES = [
  "_id", "department", "division", "campus", "term", "section",
  "term", "postrequisite", "tutorials", "breadth", "time", "instructor",
  "location", "size", "rating"
]

router.get('/', function(req, res) {

  var query = req.query
  var clean = true
  var keys = []

  for (var key in query) {
    if (QUERIES.indexOf(key.toLowerCase()) < 0) {
      clean = false
    }
    keys.push(key)
  }

  if (!clean) {
    res.send(400)
  } else {
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].toLowerCase()
      var quer = query[key]
    }
  }

})

module.exports = router
