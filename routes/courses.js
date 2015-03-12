var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

// Valid parameters
var PARAMS = [
  "code", "name", "description", "division", "department", "prerequisite",
  "exclusion", "level", "breadths", "campus", "term", "instructors",
  "location", "size", "rating", "day", "start", "end", "duration", "class_size"
]

// What the parameters map to in MongoDB
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
  "duration": "meeting_sections.times.duration",
  "location": "meeting_sections.times.location",
  "class_size": "meeting_sections.class_size"
}

// The heavenly schema, mapping what our database holds data like
var courseSchema = new mongoose.Schema({
  course_id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  prerequisites: String,
  exlusions: String,
  course_level: Number,
  campus: String,
  term: String,
  breadths: [Number],
  apsc_elec: String,
  meeting_sections: [new mongoose.Schema({
    code: String,
    instructors: [String],
    times: [new mongoose.Schema({
      day: String,
      start: Number,
      end: Number,
      duration: Number,
      location: String
    })],
    class_size: Number
    //class_enrolment: Number
  })]
})

var Courses = mongoose.model("courses", courseSchema)

// When searching for exact ID
router.get('/:id', function(req, res) {
  if (req.params.id != undefined && req.params.id != "") {
    var search = {}
    search['course_id'] = req.params.id
    Courses.find(search, function(err, docs) {
      res.json(docs)
    })
  } else {
    res.send(403)
  }
})

// When searching with the parameters
router.get('/', function(req, res) {

  // For tracking time it takes to complete a request
  var start = new Date()

  var search = { $and: [] }
  var query = req.query
  var clean = true
  var queries = 0

  var isMapReduce = false
  var mapReduceData = []

  console.log(query)

  for (var key in query) {

    key = key.toLowerCase()

    if (PARAMS.indexOf(key) > -1 && query[key].length > 0) {

      // Format the query to a MongoDB friendly search object
      var q = parseQuery(key, query[key])

      if (q.isValid) {
        queries++
        search.$and = search.$and.concat(q.query)

        if(q.isMapReduce) {
          isMapReduce = true
          mapReduceData.push(q.mapReduceData)
        }

      } else {
        res.status(403).end()
        return
      }

    } else {
      res.status(403).end()
      return
    }

  }

  // Only process a query if it has more than query
  if (queries > 0) {

    if(isMapReduce) {

      var o = {
        query: search,
        scope: {
          data: mapReduceData
        }
      }

      o.map = function() {
        /*
          Rundown:
          --------

          We're given an array like this (called "data"):

            [
              [
                [something, something],
                [something]
              ],
              [
                [something, something]
              ]
            ]

          We need to format this array, so the deepest layer are OR, the
          middle layer is AND, and the first layer is AND.

          Each "something" looks like the following:

            {
              key
              operater
              value
            }

          And we have to evaluate if the statement is true or not, and then
          append the necessary AND or OR logic to overall, come up with
          whether the current meeting section is a yes or a no.
        */

        filteredSections = []

        for(var h = 0; h < this.meeting_sections.length; h++) {
          var s = this.meeting_sections[h]

          var currentData = []

          for(var i = 0; i < data.length; i++) {
            currentData[i] = []
            for(var j = 0; j < data[i].length; j++) {
              currentData[i][j] = []
              for(var k = 0; k < data[i][j].length; k++) {

                var p = data[i][j][k]
                var value = undefined

                if(["code", "class_size", "class_enrolment", "instructors"].indexOf(p.key) > -1) {
                    value = s[p.key]
                } else if(["day", "start", "end", "duration", "location"].indexOf(p.key) > -1) {
                  value = []
                  for(var l = 0; l < s.times.length; l++) {
                    value.push(s.times[l][p.key])
                  }
                }

                if(value.constructor === Array) {

                  /*
                    Have to search through arrays of values here, efficiently.
                    If one of the conditions are true, the whole value is considered
                    true
                  */

                  bools = []

                  if(p.operator == "-") {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(!value[l].match(p.value))
                    }
                  } else if(p.operator == ">") {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(value[l] > p.value)
                    }
                  } else if(p.operator == "<") {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(value[l] < p.value)
                    }
                  } else if(p.operator == ".>") {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(value[l] >= p.value)
                    }
                  } else if(p.operator == ".<") {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(value[l] <= p.value)
                    }
                  } else {
                    for(var l = 0; l < value.length; l++) {
                      bools.push(value[l] > p.value)

                      if(!isNaN(value[l])) {
                        bools.push(value[l] == p.value)
                      } else {
                        bools.push(value[l].match(p.value))
                      }
                    }
                  }

                  currentData[i][j].push(bools.some(Boolean))

                } else {

                  if(p.operator == "-") {
                    currentData[i][j].push(!value.match(p.value))
                  } else if(p.operator == ">") {
                    currentData[i][j].push(value > p.value)
                  } else if(p.operator == "<") {
                    currentData[i][j].push(value < p.value)
                  } else if(p.operator == ".>") {
                    currentData[i][j].push(value >= p.value)
                  } else if(p.operator == ".<") {
                    currentData[i][j].push(value <= p.value)
                 } else {
                   if(!isNaN(value)) {
                     currentData[i][j].push(value == p.value)
                   } else {
                     currentData[i][j].push(value.match(p.value))
                   }
                 }

                }

              }
            }
          }

          for(var i = 0; i < currentData.length; i++) {
            for(var j = 0; j < currentData[i].length; j++) {
              currentData[i][j] = currentData[i][j].some(Boolean)
            }
            currentData[i] = currentData[i].every(Boolean)
          }

          var isValidSection = currentData.every(Boolean)

          if(isValidSection) {
            filteredSections.push(s)
          }
        }



        if(filteredSections.length > 0) {
          this.matched_meeting_sections = filteredSections
          emit(this._id, this)
        }

      }

      o.reduce = function(key, values) {
        return values[0]
      }

      Courses.mapReduce(o, function(err, docs) {
        var timer = "MapReduce completed in " + Math.abs(new Date() - start) + "ms"
        console.log(timer)

        formattedDocs = []

        docs.forEach(function(doc) {
          delete doc.value["_id"]
          formattedDocs.push(doc.value)
        })

        res.json(formattedDocs)
      })

    } else {

      Courses.find(search, function(err, docs) {
        var timer = "Query completed in " + Math.abs(new Date() - start) + "ms"
        console.log(timer)

        res.json(docs)
      })

    }


  } else {
    res.status(403).end()
    return
  }

})

function parseQuery(key, query) {

  // Response format
  var response = {
    isValid: true,
    isMapReduce: false,
    mapReduceData: {},
    query: {}
  }

  var mapReduceFilters = []

  // Split on the AND operator
  parts = query.split(",")
  for(var x = 0; x < parts.length; x++) {

    // Split on the OR operator
    parts[x] = { $or: parts[x].split("/") }
    var orMapReduceFilters = []
    for (var y = 0; y < parts[x].$or.length; y++) {

      //Format the specific part of the query
      var part = formatPart(key, parts[x].$or[y])

      if(part.isValid) {

        if(part.isMapReduce) {
          response.isMapReduce = true

          var filter = {
            key: part.key,
            operator: part.mapReduceData.operator,
            value: part.mapReduceData.value
          }

          orMapReduceFilters.push(filter)

        }

        parts[x].$or[y] = part.query
      } else {
        response.isValid = false
        return response
      }

    }

    mapReduceFilters.push(orMapReduceFilters)
  }

  if(response.isMapReduce) {
    response.mapReduceData = mapReduceFilters
  }

  response.query = parts
  return response

}

function formatPart(key, part) {

  // Response format
  var response = {
    key: key,
    isValid: true,
    isTimeQuery: false,
    isMapReduce: false,
    mapReduceData: {},
    query: {},
    timeQuery: {}
  }


  // Checking if the start of the segment is an operator (-, >, <, .>, .<)
  if(part.indexOf("-") === 0) {
    // Negation
    part = {
      operator: "-",
      value: part.substring(1)
    }
  } else if(part.indexOf(">") === 0) {
    part = {
      operator: ">",
      value: part.substring(1)
    }
  } else if(part.indexOf("<") === 0) {
    part = {
      operator: "<",
      value: part.substring(1)
    }
  } else if(part.indexOf(".>") === 0) {
    part = {
      operator: ".>",
      value: part.substring(2)
    }
  } else if(part.indexOf(".<") === 0) {
    part = {
      operator: ".<",
      value: part.substring(2)
    }
  } else {
    part = {
      operator: undefined,
      value: part
    }
  }

  /*
    WE STILL GOTTA VALIDATE THE QUERY HERE, WOW I KEEP PUTTING IT OFF.

    Basically, if the query is valid, we're good to go. If it isn't, set
    response.isValid to false and return the response object.
  */

  if (["breadths", "level", "class_size", "class_enrolment"].indexOf(key) > -1) {
    // Integers and arrays of integers (mongo treats them the same)

    part.value = parseInt(part.value)
    if(part.operator == "-") {
      response.query[KEYMAP[key]] = { $ne: part.value }
    } else if(part.operator == ">") {
      response.query[KEYMAP[key]] = { $gt: part.value }
    } else if(part.operator == "<") {
      response.query[KEYMAP[key]] = { $lt: part.value }
    } else if(part.operator == ".>") {
      response.query[KEYMAP[key]] = { $gte: part.value }
    } else if(part.operator == ".<") {
      response.query[KEYMAP[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[KEYMAP[key]] = part.value
    }

    if(["class_size", "class_enrolment"].indexOf(key) > -1) {
      response.isMapReduce = true
      response.mapReduceData = part
    }


  } else if(["start", "end", "duration"].indexOf(key) > -1) {
    //time related

    part.value = parseInt(part.value)

    response.isMapReduce = true
    response.mapReduceData = part

    if(part.operator == "-") {
      response.query[KEYMAP[key]] = { $ne: part.value }
    } else if(part.operator == ">") {
      response.query[KEYMAP[key]] = { $gt: part.value }
    } else if(part.operator == "<") {
      response.query[KEYMAP[key]] = { $lt: part.value }
    } else if(part.operator == ".>") {
      response.query[KEYMAP[key]] = { $gte: part.value }
    } else if(part.operator == ".<") {
      response.query[KEYMAP[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[KEYMAP[key]] = part.value
    }

  } else if(key == "instructors") {
    // Array of strings

    response.isMapReduce = true
    response.mapReduceData = part

    if(part.operator == "-") {
      response.query[KEYMAP[key]] = { $not: {
        $elemMatch: { $regex: "(?i).*" + part.value + ".*" }
      } }
    } else {
      response.query[KEYMAP[key]] = {
        $elemMatch: { $regex: "(?i).*" + part.value + ".*" }
      }
    }

  } else {
    // Just your average string

    if(part.operator == "-") {
      response.query[KEYMAP[key]] = {
        $regex: "^((?!" + part.value + ").)*$",
        $options: 'i'
      }
    } else {
      response.query[KEYMAP[key]] = { $regex: "(?i).*" + part.value + ".*" }
    }

    if(key == "location") {
      response.isMapReduce = true
      response.mapReduceData = part
    }

  }

  return response

}

function timeToNumber(str) {
  var time = str.split(":")
  return parseInt(time[0]) + (parseInt(time[1]) / 60)
}

module.exports = router
