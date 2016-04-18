import Athletics from '../model'
import co from 'co'

const ABSOLUTE_KEYMAP = {
  date: 'date',
  campus: 'campus',
  title: 'events.title',
  location: 'events.location',
  start: 'events.start_time',
  end: 'events.end'
}

export default function filter(req, res, next) {
  let q = req.query.q
  q = q.split(' AND ')

  let queries = 0

  let filter = { $and: q }

  for (let i = 0; i < filter.$and.length; i++) {
    filter.$and[i] = { $or: q[i].trim().split(' OR ')}

    for (let j = 0; j < filter.$and[i].$or.length; j++) {
      let part = filter.$and[i].$or[j].trim().split(':')
      let x = formatPart(part[0], part[1])

      if (x.isValid) {
        filter.$and[i].$or[j] = x.query
        queries++
      }
    }
  }
  if(queries > 0) {
    co(function* () {
      try {
        let docs = yield Athletics
          .find(filter, '-__v -_id -events._id')
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

function formatPart(key, part) {
  // Response format
  let response = {
    key: key,
    isValid: true,
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

  if (['date', 'start', 'end'].indexOf(key) > -1) {
    // Dates

    let dateValues = part.value.split(',')
    let d = dateValues.concat(new Array(7 - dateValues.length).fill(0))

    // Months[1] start at index 0 (Jan->0, Dec->11), hours[3] are altered for EST
    let date = new Date(d[0], d[1]-1, d[2], d[3]-4, d[4], d[5], d[6], d[7])
    if (isNaN(date)) {
      date = new Date()
    }

    if (part.operator === '-') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $ne: date }
    } else if (part.operator === '>') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $gt: date }
    } else if (part.operator === '<') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $lt: date }
    } else if (part.operator === '>=') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $gte: date }
    } else if (part.operator === '<=') {
      response.query[ABSOLUTE_KEYMAP[key]] = { $lte: date }
    } else {
      // Assume equality if no operator
      response.query[ABSOLUTE_KEYMAP[key]] = date
    }
  } else {
    // Strings

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
