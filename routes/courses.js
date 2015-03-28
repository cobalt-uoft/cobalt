var express = require('express')
var mongoose = require('mongoose')
var Courses = require('../schemas/courses')
var router = express.Router()
var limit = 10

// Valid parameters


// What the parameters map to in MongoDB


// When searching for exact ID
router.get('/:id', function(req, res) {
  if (req.params.id) {
    Courses.find({
      course_id: req.params.id
    }, function(err, docs) {
      res.json(docs[0])
    })
  } else {
    res.status(403).end()
    return
  }
})

router.get('/', function(req, res) {
  console.log('hallo')
  if(req.query.q) {

    var qLimit = limit
    if(req.query.limit && req.query.limit < 100) {
      qLimit = req.query.limit
    }

    Courses.find({
      $text: {
        $search: req.params.q
      }
    }).limit(qLimit).exec(function(err, docs) {
      res.json(docs)
    })

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



function timeToNumber(str) {
  var time = str.split(":")
  return parseInt(time[0]) + (parseInt(time[1]) / 60)
}

module.exports = router
