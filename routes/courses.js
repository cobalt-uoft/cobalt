var express = require('express')
var router = express.Router()

var QUERIES = [
  "_id", "department", "division", "campus", "term", "section",
  "term", "postrequisite", "tutorials", "breadth", "time", "instructor",
  "location", "size", "rating"
]

var courseSchema = new mongoose.Schema({
  course_id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  prerequisites: String,
  exlusions: String,
  course_level: String,
  breadth: Array,
  campus: String,
  term: String,
  apsc_elec: String,
  meeting_sections: Array
})
var courses = new mongoose.model("courses", courseSchema)


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

  var response = [];

  if (!clean) {
    res.send("yo")
  } else {
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].toLowerCase()
      var quer = query[key]
      if (key = "_id") {
        response.push(getIdQuery(quer))
      }
    }
  }

})

function getIdQuery(key, quer) {
  return courses.find({
    key: quer
  })
}

module.exports = router
