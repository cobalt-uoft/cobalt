var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

var QUERIES = [
  "code", "department", "division", "campus", "term", "section",
  "term", "postrequisite", "tutorials", "breadth", "time", "instructor",
  "location", "size", "rating"
]

var KEYMAP = {
  "code": "code",
  "name": "name",
  "description": "description",
  "division": "division",
  "department": "department",
  "prerequisites": "prerequisites",
  "exclusions": "exclusions",
  "course_level": "course_level",
  "breadths": "breadths",
  "campus": "campus",
  "term": "term",
  "apsc_elec": "apsc_elec",
  "meeting_code": "meeting_sections.code",
  "instructors": "meeting_sections.instructors",
  "day": "meeting_sections.times.day",
  "start": "meeting_sections.times.start",
  "end": "meeting_sections.times.end",
  "location": "meeting_sections.times.location",
}

var timesSchema = new mongoose.Schema({
  day: String,
  start: String,
  end: String,
  location: String
})

var meetingSchema = new mongoose.Schema({
  code: String,
  instructors: [String],
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

router.get('/:id', function(req, res) {
  if (req.params.id != undefined && req.params.id != "") {
    var search = {}
    search['course_id'] = req.params.id;
    courses.find(search, function(err, docs) {
      res.json(docs)
    })
  } else {
    res.send(403)
  }
})

router.get('/', function(req, res) {

  var search = {}

  var query = req.query
  var clean = true

  queries = 0

  for (var key in query) {

    key = key.toLowerCase()

    if (QUERIES.indexOf(key) > 0 && query[key].length > 0) {

      // Some serious sanitization on every parameter shit over here

      var good = true
      if (key == "breadths") {
        // Do something for array search????

<<<<<<< HEAD
      } else if (key =="instructors") {
        // Is the split AND or OR? who knows (spoiler: its both)
=======
      } else if (key == "instructors") {
        // Is the split AND or OR? who knows
        //
>>>>>>> FETCH_HEAD
        var instructors = query[key].split(",")
      } else {
        search[KEYMAP[key]] = {
          $regex: "(?i).*" + query[key] + ".*"
        }
      }

      if (!good) {
        res.send(403)
      } else {
        queries++
      }

    } else {
      res.send(403)
    }

  }

  if (queries > 0) {
    courses.find(search, function(err, docs) {
      res.json(docs)
    })
  } else {
    res.send(403)
  }

})

/**
 * Do fancy things
 * :)
 */
var testFunc = function() {
  res.send(200)
}

var parseBool = function(query) {
  //magical non-brackets solution here
}
module.exports = router
