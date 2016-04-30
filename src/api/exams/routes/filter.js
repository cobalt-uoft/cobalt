import Athletics from '../model'
import co from 'co'
import mapReduce from './filterMapReduce'

// TODO add filters for sections.exam_section

const KEYMAP = {
  id: 'course_id',
  code: 'course_code',
  campus: 'campus',
  period: 'period',
  date: 'date',
  start: 'start_time',
  duration: 'duration',
  end: 'end_time',
  lecture: 'lecture_code',
  location: 'location'
}

const ABSOLUTE_KEYMAP = {
  id: 'course_id',
  code: 'course_code',
  campus: 'campus',
  period: 'period',
  date: 'date',
  start: 'start_time',
  end: 'end_time',
  duration: 'duration',
  lecture: 'sections.lecture_code',
  location: 'sections.location'
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
      let query = filter.$and[i].$or[j].trim()
      let part = [query.slice(0, query.indexOf(':')), query.slice(query.indexOf(':') + 1)]

      let x = formatPart(part[0], part[1])

      if (x.isValid) {
        if (x.isMapReduce) {
          isMapReduce = true
          x.mapReduceData.key = KEYMAP[x.key]
          mapReduceOr.push(x.mapReduceData)
        }

        filter.$and[i].$or[j] = x.query
        queries++
      } else if (x.error) {
        return next(x.error)
      }

      if (mapReduceOr.length > 0) {
        mapReduceData.push(mapReduceOr)
      }
    }
  }
  if(queries > 0) {
    if(isMapReduce) {
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
          let docs = yield Athletics.mapReduce(o)

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
          let docs = yield Athletics
            .find(filter, '-__v -_id -sections._id')
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
    error: null,
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
    part.value = parseFloat(part.value)
  }


  if (['date', 'start', 'end', 'duration'].indexOf(key) > -1) {
    if (key == 'date') {
      let dateValue = undefined

      if (typeof part.value !== 'number' && part.value.indexOf(',') !== -1) {
        // Date format is Y,m,d,H,M,S
        let d = part.value.split(',')
        d = d.concat(new Array(7 - d.length).fill(0))
        dateValue = new Date(d[0], d[1]-1, d[2], d[3]-4, d[4], d[5], d[6], d[7])
      } else {
        // Date format is ISO-8601, milliseconds since 01-01-1970, or empty
        dateValue = part.value
      }

      let date = dateValue && dateValue.length ? new Date(dateValue) : new Date

      if (isNaN(date)) {
        response.isValid = false
        response.error = new Error('Invalid date parameter.')
        response.error.status = 400
        return response
      }

      part.value = date
    }

    if (part.operator === '-') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $ne: part.value }
    } else if (part.operator === '>') {
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
  } else {
    // Strings
    if (['lecture', 'section', 'location'].indexOf(key) > -1) {
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
