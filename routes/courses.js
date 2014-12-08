var express = require('express')
var router = express.Router()

var QUERIES = [
  "_id", "department", "division", "campus", "term", "section",
  "term", "postrequisite", "tutorials", "breadth", "time", "instructor",
  "location", "size", "rating"
]

var mongoose = require('mongoose');
var Schema = mongoose.schema;
var courseSchema = new Schema{
  code: String
  name: String
  description: String
  division: String
  prerequisite: String
  exlusions String
  course_level: String
  breadth: Array
  campus: String
  term: String
  APSC_elec: String
  meeting_sections: Array
}
var course = new mongoose.model("Course", schema)

mongoose.connect('put data base here');

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
      if(quer = "_id"){
        response.push(getIdQuery())
      }
    }
  }

})

function getIdQuery() = {
}

module.exports = router
