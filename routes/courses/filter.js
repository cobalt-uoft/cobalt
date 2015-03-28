var express = require('express')
var Courses = require('../../schemas/courses')
var router = express.Router()

var limit = 10

var PARAMS = [
  "code", "name", "description", "division", "department", "prerequisite",
  "exclusion", "level", "breadth", "campus", "term", "instructor",
  "location", "rating", "day", "start", "end", "duration", "size"
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
  "breadth": "breadths",
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
  "size": "meeting_sections.class_size"
}

router.get('/', function(req, res) {

  var start = new Date()

  if(req.query.q) {

    var qLimit = limit
    if(req.query.limit && req.query.limit < 100) {
      qLimit = req.query.limit
    }

    var q = req.query.q
    q = q.split('AND')

    var queries = 0
    var isMapReduce = false
    var mapReduceData = []

    var filter = { $and: q }

    for(var i = 0; i < filter.$and.length; i++) {
      filter.$and[i] = { $or: q[i].trim().split('OR') }
      var mapReduceOr = []
      for(var j = 0; j < filter.$and[i].$or.length; j++) {
        var part = filter.$and[i].$or[j].trim().split(":")
        var x = formatPart(part[0], part[1].substr(1, part[1].length - 2))

        if(x.isValid) {
          if(x.isMapReduce) {
            isMapReduce = true
            x.mapReduceData.key = x.key
            mapReduceOr.push(x.mapReduceData)
          }
          queries++
          filter.$and[i].$or[j] = x.query
        }
      }
      if(filter.$and[i].$or.length == 1) {
        filter.$and[i] = filter.$and[i].$or[0]
      }
      mapReduceData.push(mapReduceOr)
    }

    if(queries > 0 ) {

      if(isMapReduce) {

        console.log(mapReduceData)

        var o = {
          query: filter,
          scope: {
            data: mapReduceData
          },
          limit: qLimit
        }

        o.map = function() {

          var matchedSections = []

          for(var h = 0; h < this.meeting_sections.length; h++) {
              var s = this.meeting_sections[h]

              var currentData = []

              for(var i = 0; i < data.length; i++) {
                currentData[i] = []
                for(var j = 0; j < data[i].length; j++) {
                  currentData[i][j] = false
                  var p = data[i][j]
                  var value = undefined

                  if(["meeting_code", "size", "enrolment", "instructor"].indexOf(p.key) > -1) {
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

                    currentData[i][j] = bools.some(Boolean)

                  } else {

                    if(p.operator == "-") {
                      currentData[i][j] = !value.match(p.value)
                    } else if(p.operator == ">") {
                      currentData[i][j] = value > p.value
                    } else if(p.operator == "<") {
                      currentData[i][j] = value < p.value
                    } else if(p.operator == ".>") {
                      currentData[i][j] = value >= p.value
                    } else if(p.operator == ".<") {
                      currentData[i][j] = value <= p.value
                   } else {
                     if(!isNaN(value)) {
                       currentData[i][j] = value == p.value
                     } else {
                       currentData[i][j] = value.match(p.value)
                     }
                   }

                  }

                }

                currentData[i] = currentData[i].some(Boolean)
              }

              currentData = currentData.every(Boolean)

              if(currentData) {
                matchedSections.push(s)
              }

              if(matchedSections.length > 0) {
                this.matched_meeting_sections = matchedSections
                emit(this._id, this)
              }

          }
        }

        o.reduce = function(key, values) {
          return values[0]
        }

        Courses.mapReduce(o, function(err, docs) {
          var timer = "MapReduce completed in " + Math.abs(new Date() - start) + "ms"
          console.log(timer)
          console.log(err)
          formattedDocs = []

          docs.forEach(function(doc) {
            delete doc.value["_id"]
            formattedDocs.push(doc.value)
          })

          res.json(formattedDocs)
        })

      } else {
        Courses.find(filter).limit(qLimit).exec(function(err, docs) {
          var timer = "Query completed in " + Math.abs(new Date() - start) + "ms"
          console.log(timer)

          res.json(docs)
        })
      }

    }

  }

})

function formatPart(key, part) {

  // Response format
  var response = {
    key: key,
    isValid: true,
    isMapReduce: false,
    mapReduceData: {},
    query: {}
  }


  // Checking if the start of the segment is an operator (-, >, <, .>, .<)
  if(part.indexOf("-") === 0) {
    // Negation
    part = {
      operator: "-",
      value: part.substring(1)
    }
  } else if(part.indexOf(">=") === 0) {
    part = {
      operator: ">=",
      value: part.substring(2)
    }
  } else if(part.indexOf("<=") === 0) {
    part = {
      operator: "<=",
      value: part.substring(2)
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

  if (["breadth", "level", "size", "enrolment"].indexOf(key) > -1) {
    // Integers and arrays of integers (mongo treats them the same)

    part.value = parseInt(part.value)
    if(part.operator == "-") {
      response.query[KEYMAP[key]] = { $ne: part.value }
    } else if(part.operator == ">") {
      response.query[KEYMAP[key]] = { $gt: part.value }
    } else if(part.operator == "<") {
      response.query[KEYMAP[key]] = { $lt: part.value }
    } else if(part.operator == ">=") {
      response.query[KEYMAP[key]] = { $gte: part.value }
    } else if(part.operator == "<=") {
      response.query[KEYMAP[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[KEYMAP[key]] = part.value
    }

    if(["size", "enrolment"].indexOf(key) > -1) {
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
    } else if(part.operator == ">=") {
      response.query[KEYMAP[key]] = { $gte: part.value }
    } else if(part.operator == "<=") {
      response.query[KEYMAP[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[KEYMAP[key]] = part.value
    }

  } else if(key == "instructor") {
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

module.exports = router
