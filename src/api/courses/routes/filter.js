import Course from '../model'
import co from 'co'
import mapReduce from './filterMapReduce'

// The flat keymap
const KEYMAP = {
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

// The absolute (from root) keymap
const ABSOLUTE_KEYMAP = {
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

export default function filter(req, res, next) {
  let q = req.query.q
  q = q.split(' AND ')

  let queries = 0
  let isMapReduce = false
  let mapReduceData = []

  let filter = { $and: q }

  for (let i = 0; i < filter.$and.length; i++) {
    filter.$and[i] = { $or: q[i].trim().split(' OR ') }
    let mapReduceOr = []
    for (let j = 0; j < filter.$and[i].$or.length; j++) {
      let part = filter.$and[i].$or[j].trim().split(':')
      let x = formatPart(part[0], part[1])

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
        limit: req.query.limit,
        map: mapReduce.map,
        reduce: mapReduce.reduce
      }

      co(function* () {
        try {
          let docs = yield Course.mapReduce(o)

          let formattedDocs = []
          for (let doc of docs) {
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
          let docs = yield Course
            .find(filter, '-__v -_id -meeting_sections._id -meeting_sections.times._id')
            .limit(req.query.limit)
            .skip(req.query.skip)
            .sort(req.query.sort)
            .exec()
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
  let response = {
    key: key,
    isValid: true,
    isMapReduce: false,
    mapReduceData: {},
    query: {}
  }

  // Checking if the start of the segment is an operator (-, >, <, .>, .<)
  if (part.indexOf('-') === 0) {
    // Negation
    part = {
      operator: '-',
      value: part.substring(1)
    }
  } else if (part.indexOf('>=') === 0) {
    part = {
      operator: '>=',
      value: part.substring(2)
    }
  } else if (part.indexOf('<=') === 0) {
    part = {
      operator: '<=',
      value: part.substring(2)
    }
  } else if (part.indexOf('>') === 0) {
    part = {
      operator: '>',
      value: part.substring(1)
    }
  } else if (part.indexOf('<') === 0) {
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
    if (part.operator === '-') {
      part.value = -part.value
    }
  }

  if (['breadth', 'level', 'size', 'enrolment', 'start', 'end', 'duration'].indexOf(key) > -1) {
    // Integers and arrays of integers (mongo treats them the same)

    if (['size', 'enrolment', 'start', 'end', 'duration'].indexOf(key) > -1) {
      response.isMapReduce = true
      response.mapReduceData = part
    }

    if (part.operator === '>') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $gt: part.value }
    } else if (part.operator === '<') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $lt: part.value }
    } else if (part.operator === '>=') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $gte: part.value }
    } else if (part.operator === '<=') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $lte: part.value }
    } else {
      // Assume equality if no operator
      response.query[ABSOLUTE_KEYMAP[key]] = part.value
    }
  } else if (key.match('instructor')) {
    // Array of strings
    response.isMapReduce = true
    response.mapReduceData = part

    if (part.operator === '-') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $not: { $elemMatch: { $regex: '(?i).*' + escapeRe(part.value) + '.*' } } }
    } else {
      response.query[ABSOLUTE_KEYMAP[key]] = { $elemMatch: { $regex: '(?i).*' + escapeRe(part.value) + '.*' } }
    }
  } else {
    // Strings
    if (['location', 'meeting_code'].indexOf(key) > -1) {
      response.isMapReduce = true
      response.mapReduceData = part
    }

    if (part.operator === '-') {
      response.query[ABSOLUTE_KEYMAP[key]] = {
        $regex: '^((?!' + escapeRe(part.value) + ').)*$',
        $options: 'i'
      }
    } else {
      response.query[ABSOLUTE_KEYMAP[key]] = { $regex: '(?i).*' + escapeRe(part.value) + '.*' }
    }
  }

  return response
}

function escapeRe(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}
