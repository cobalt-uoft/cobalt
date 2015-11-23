import Course from '../model'
import co from 'co'

var limit = 10
var skip = 0

/*
  POSSIBLE PARAMETERS:
  'code', 'name', 'description', 'division', 'department', 'prerequisite',
  'exclusion', 'level', 'breadth', 'campus', 'term', 'instructor',
  'location', 'rating', 'day', 'start', 'end', 'duration', 'size',
  'session'
*/

//The flat (relative to first root) keymap
var KEYMAP = {
  'code': 'code',
  'name': 'name',
  'description': 'description',
  'division': 'division',
  'department': 'department',
  'prerequisite': 'prerequisites',
  'exclusion': 'exclusions',
  'level': 'level',
  'breadth': 'breadths',
  'campus': 'campus',
  'term': 'term',
  'meeting_code': 'code',
  'instructor': 'instructors',
  'day': 'day',
  'start': 'start',
  'end': 'end',
  'duration': 'duration',
  'location': 'location',
  'size': 'size',
  'enrolment': 'enrolment'
}

//The absolute (from main root) keymap
var KEYMAP2 = {
  'code': 'code',
  'name': 'name',
  'description': 'description',
  'division': 'division',
  'department': 'department',
  'prerequisite': 'prerequisites',
  'exclusion': 'exclusions',
  'level': 'level',
  'breadth': 'breadths',
  'campus': 'campus',
  'term': 'term',
  'meeting_code': 'meeting_sections.meeting_code',
  'instructor': 'meeting_sections.instructors',
  'day': 'meeting_sections.times.day',
  'start': 'meeting_sections.times.start',
  'end': 'meeting_sections.times.end',
  'duration': 'meeting_sections.times.duration',
  'location': 'meeting_sections.times.location',
  'size': 'meeting_sections.size',
  'enrolment': 'meeting_sections.enrolment'
}

export default function main(req, res, next) {
  if (!req.query.q) {
    let err = new Error('Query must be specified.')
    err.status = 400
    return next(err)
  } else if (req.query.q.length < 3) {
    let err = new Error('Query must be of length greater than 2.')
    err.status = 400
    return next(err)
  }

  let qLimit = limit
  if (req.query.limit) {
    if (isNaN(req.query.limit) || req.query.limit < 1 || req.query.limit > 100) {
      let err = new Error('Limit must be a positive integer greater than 1 and less than or equal to 100.')
      err.status = 400
      return next(err)
    }
    qLimit = req.query.limit
  }

  let qSkip = skip
  if (req.query.skip) {
    if (isNaN(req.query.skip) || req.query.skip < 0) {
      let err = new Error('Skip must be a positive integer.')
      err.status = 400
      return next(err)
    }
    qSkip = req.query.skip
  }

  var q = req.query.q
  q = q.split(' AND ')

  var queries = 0
  var isMapReduce = false
  var mapReduceData = []

  var filter = { $and: q }

  for (var i = 0; i < filter.$and.length; i++) {
    filter.$and[i] = { $or: q[i].trim().split(' OR ') }
    var mapReduceOr = []
    for (var j = 0; j < filter.$and[i].$or.length; j++) {
      var part = filter.$and[i].$or[j].trim().split(':')
      var x = formatPart(part[0], part[1])

      if (x.isValid) {
        if (x.isMapReduce) {
          isMapReduce = true
          x.mapReduceData.key = KEYMAP[x.key]
          mapReduceOr.push(x.mapReduceData)
        }

        filter.$and[i].$or[j] = x.query

        queries++
      }
    }


    if (mapReduceOr.length > 0) {
      mapReduceData.push(mapReduceOr)
    }

  }

  if(queries > 0) {

    if(isMapReduce) {

      if(filter.$and.length === 0) {
        filter = {}
      }

      var o = {
        query: filter,
        scope: {
          data: mapReduceData
        },
        limit: qLimit
      }

      /*
        Disabling eslint, because this method goes to MongoDB, making the
        linter get confused.
      */

      /* eslint-disable */
      o.map = function() {
        var matchedSections = []

        for(let h = 0; h < this.meeting_sections.length; h++) {
          var s = this.meeting_sections[h]

          var currentData = []

          for(let i = 0; i < data.length; i++) {
            currentData[i] = []

            for(let j = 0; j < data[i].length; j++) {
              currentData[i][j] = false
              var p = data[i][j]
              var value

              if(['code', 'size', 'enrolment', 'instructors'].indexOf(p.key) > -1) {
                value = s[p.key]
              } else if(['day', 'start', 'end', 'duration', 'location'].indexOf(p.key) > -1) {
                value = []
                for(var l = 0; l < s.times.length; l++) {
                  value.push(s.times[l][p.key])
                }
              }

              if(value.constructor === Array) {
                var bools = []

                if(p.operator === '-') {
                  for(let l = 0; l < value.length; l++) {
                    bools.push(!value[l].match(p.value))
                  }
                } else if(p.operator === '>') {
                  for(let l = 0; l < value.length; l++) {
                    bools.push(value[l] > p.value)
                  }
                } else if(p.operator === '<') {
                  for(let l = 0; l < value.length; l++) {
                    bools.push(value[l] < p.value)
                  }
                } else if(p.operator === '>=') {
                  for(let l = 0; l < value.length; l++) {
                    bools.push(value[l] >= p.value)
                  }
                } else if(p.operator === '<=') {
                  for(let l = 0; l < value.length; l++) {
                    bools.push(value[l] <= p.value)
                  }
                } else {
                  for(let l = 0; l < value.length; l++) {
                    if(!isNaN(value[l])) {
                      bools.push(value[l] === p.value)
                    } else {
                      bools.push(value[l].match(p.value))
                    }
                  }
                }

                currentData[i][j] = bools.some(Boolean)
              } else {
                if(p.operator === '-') {
                  currentData[i][j] = !value.match(p.value)
                } else if(p.operator === '>') {
                  currentData[i][j] = value > p.value
                } else if(p.operator === '<') {
                  currentData[i][j] = value < p.value
                } else if(p.operator === '>=') {
                  currentData[i][j] = value >= p.value
                } else if(p.operator === '<=') {
                  currentData[i][j] = value <= p.value
                } else {
                  if(!isNaN(value)) {
                    currentData[i][j] = value === p.value
                  } else {
                    currentData[i][j] = value.match(p.value)
                  }
                }
              }
            }
          }

          for(let i = 0; i < currentData.length; i++) {
            currentData[i] = currentData[i].some(Boolean)
          }

          currentData = currentData.every(Boolean)

          if(currentData) {
            matchedSections.push(s)
          }
        }

        if(matchedSections.length > 0) {
          this.matched_meeting_sections = matchedSections
          emit(this._id, this)
        }
      }

      o.reduce = function(key, values) {
        return values[0]
      }
      /* eslint-enable */

      co(function* () {
        try {
          var docs = yield Course.mapReduce(o)
          // TODO: revisit this formatting stuff, looks weird
          var formattedDocs = []
          for(let doc of docs) {
            delete doc.value._id
            formattedDocs.push(doc.value)
          }
          res.json(formattedDocs)
        } catch(e) {
          return next(e)
        }
      })
    } else {
      co(function* () {
        try {
          var docs = yield Course.find(filter, '-_id').skip(qSkip).limit(qLimit).exec()
          res.json(docs)
        } catch(e) {
          return next(e)
        }
      })
    }
  }
}

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
  if(part.indexOf('-') === 0) {
    // Negation
    part = {
      operator: '-',
      value: part.substring(1)
    }
  } else if(part.indexOf('>=') === 0) {
    part = {
      operator: '>=',
      value: part.substring(2)
    }
  } else if(part.indexOf('<=') === 0) {
    part = {
      operator: '<=',
      value: part.substring(2)
    }
  } else if(part.indexOf('>') === 0) {
    part = {
      operator: '>',
      value: part.substring(1)
    }
  } else if(part.indexOf('<') === 0) {
    part = {
      operator: '<',
      value: part.substring(1)
    }
  } else {
    part = {
      operator: undefined,
      value: part
    }
  }

  if (isNaN(parseFloat(part.value)) || !isFinite(part.value)) {
    // Is not a number
    part.value = part.value.substring(1, part.value.length - 1)
  } else {
    part.value = parseInt(part.value)
  }

  /* TODO: Validate query? */

  if (['breadth', 'level', 'size', 'enrolment', 'start', 'end', 'duration'].indexOf(key) > -1) {
    // Integers and arrays of integers (mongo treats them the same)

    if(['size', 'enrolment', 'start', 'end', 'duration'].indexOf(key) > -1) {
      response.isMapReduce = true
      response.mapReduceData = part
    }

    if(part.operator === '-') {
      response.query[KEYMAP2[key]] = { $ne: part.value }
    } else if(part.operator === '>') {
      response.query[KEYMAP2[key]] = { $gt: part.value }
    } else if(part.operator === '<') {
      response.query[KEYMAP2[key]] = { $lt: part.value }
    } else if(part.operator === '>=') {
      response.query[KEYMAP2[key]] = { $gte: part.value }
    } else if(part.operator === '<=') {
      response.query[KEYMAP2[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[KEYMAP2[key]] = part.value
    }
  } else if(key.match('instructor')) {
    // Array of strings
    response.isMapReduce = true
    response.mapReduceData = part

    if(part.operator === '-') {
      response.query[KEYMAP2[key]] = { $not: {
        $elemMatch: { $regex: '(?i).*' + escapeRe(part.value) + '.*' }
      } }
    } else {
      response.query[KEYMAP2[key]] = {
        $elemMatch: { $regex: '(?i).*' + escapeRe(part.value) + '.*' }
      }
    }
  } else {
    // Strings
    if(['location', 'meeting_code'].indexOf(key) > -1) {
      response.isMapReduce = true
      response.mapReduceData = part
    }

    if(part.operator === '-') {
      response.query[KEYMAP2[key]] = {
        $regex: '^((?!' + escapeRe(part.value) + ').)*$',
        $options: 'i'
      }
    } else {
      response.query[KEYMAP2[key]] = { $regex: '(?i).*' + escapeRe(part.value) + '.*' }
    }
  }

  return response
}

function escapeRe(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}
