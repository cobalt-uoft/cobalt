var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

var QUERIES = [
  "course_id", "code", "department", "division", "campus", "term", "section",
  "term", "postrequisite", "tutorials", "breadth", "time", "instructor",
  "location", "size", "rating"
]

var KEY_MAP = {
  "id": "course_id",
  "code": "code",
  "name": "name",
  "description": "description",
  "division": "division",
  "department": "department",
  "prerequisites": "prerequisites",
  "exclusions": "exclusions",
  "course_level": "course_level",
  "breadth": "breadth",
  "campus": "campus",
  "term": "term",
  "apsc_elec": "apsc_elec",
  "meeting_code": "meeting_sections.lectures.code",
  "instructor": "meeting_sections."
}

var timesSchema = new mongoose.Schema({
  day: String,
  start: String,
  end: String,
  location: String
})

var meetingSchema = new mongoose.Schema({
  code: String,
  instructor: String,
  times: [timesSchema]
})

var courseSchema = new mongoose.Schema({
  course_id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  prerequisites: String,
  exlusions: String,
  course_level: String,
  breadth: [Number],
  campus: String,
  term: String,
  apsc_elec: String,
  meeting_sections: [meetingSchema]
})

var courses = mongoose.model("courses", courseSchema)

router.get('/', function(req, res) {

  var query = req.query
  var clean = true
  var search = {}

  for (var key in query) {
    if (QUERIES.indexOf(key.toLowerCase()) < 0) {
      res.send("Bad")
      return
    }
    search[key] = query[key]
  }
  console.log(search)

})

function getIdQuery(key, quer) {
  return courses.find({
    key: quer
  })
}

module.exports = router
