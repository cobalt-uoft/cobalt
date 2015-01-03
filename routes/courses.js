var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

var QUERIES = [
  "code", "name", "description", "division", "department", "prerequisite",
  "exclusion", "level", "breadths", "campus", "term", "instructors",
  "location", "size", "rating"
]

var KEYMAP = {
  "code": "code",
  "name": "name",
  "description": "description",
  "division": "division",
  "department": "department",
  "prerequisite": "prerequisites",
  "exclusions": "exclusions",
  "level": "course_level",
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
  times: [timesSchema],
  class_size: Number
  //class_enrolment: Number
})

var courseSchema = new mongoose.Schema({
  course_id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  prerequisites: String,
  exlusions: String,
  course_level: Number,
  breadths: [Number],
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

  var start = new Date()

  var search = { $and: [] }

  var query = req.query
  var clean = true

  var queries = 0

  console.log(query)

  for (var key in query) {

    key = key.toLowerCase()

    if (QUERIES.indexOf(key) > -1 && query[key].length > 0) {

      var q = parseQuery(key, query[key])

      if (q.isValid) {
        queries++
        search.$and = search.$and.concat(q.query)
      } else {
        res.status(403).end()
        return
      }

    } else {
      res.status(403).end()
      return
    }

  }

  if (queries > 0) {
    console.log(JSON.stringify(search))
    courses.find(search, function(err, docs) {
      console.log("Done: " + Math.abs(new Date() - start) + "ms")
      res.json(docs)
    })
  } else {
    res.status(403).end()
    return
  }

})

var parseQuery = function(key, query) {

  var response = {
    isValid: true,
    query: {}
  }

  parts = query.split(",")
  for(var x = 0; x < parts.length; x++) {
    parts[x] = { $or: parts[x].split("/") }
    for (var y = 0; y < parts[x].$or.length; y++) {

      var part = formatPart(key, parts[x].$or[y])

      if(part.isValid) {
        parts[x].$or[y] = part.query
      } else {
        response.isValid = false
        return response
      }

    }
  }

  response.query = parts
  return response

}

var formatPart = function(key, part) {

  var response = {
    isValid: true,
    query: {}
  }

  if(part.lastIndexOf("~", 0) === 0) {
    //negation
    part = {
      operator: "~",
      value: part.substring(1)
    }
  } else {
    part = {
      operator: undefined,
      value: part
    }
  }

  //WE STILL GOTTA VALIDATE THE QUERY HERE, WOW I KEEP PUTTING IT OFF

  if (["breadths", "level", "class_size", "class_enrolment"].indexOf(key) > -1) {

    response.query[KEYMAP[key]] = parseInt(part.value)
    if(part.operator == "~") {
      response.query[KEYMAP[key]] = { $ne: response.query[KEYMAP[key]] }
    }

  } else {

    var re

    if(part.operator == "~") {
      re = { $regex: "^((?!" + part.value + ").)*$", $options: 'i' }
    } else {
      re = { $regex: "(?i).*" + part.value + ".*" }
    }

    if(key == "instructors") {
      if(part.operator == "~") {
        response.query[KEYMAP[key]] = { $not: {
          $elemMatch: { $regex: "(?i).*" + part.value + ".*" }
        } }
      } else {
        response.query[KEYMAP[key]] = {
          $elemMatch: { $regex: "(?i).*" + part.value + ".*" }
        }
      }
    } else {
      response.query[KEYMAP[key]] = re
    }

  }

  return response

}

module.exports = router
