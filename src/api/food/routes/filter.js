import Food from '../model'
import co from 'co'

const ABSOLUTE_KEYMAP = {
  'name': 'name',
  'short_name': 'short_name',
  'campus': 'campus',
  'address': 'address',
  'lat': 'lat',
  'lng': 'lng',
  'tag': 'tags',
  'sunday': {
    'open': 'hours.sunday.open',
    'close': 'hours.sunday.close',
    'is_closed': 'hours.sunday.closed'
  },
  'monday': {
    'open': 'hours.monday.open',
    'close': 'hours.monday.close',
    'is_closed': 'hours.monday.closed'
  },
  'tuesday': {
    'open': 'hours.tuesday.open',
    'close': 'hours.tuesday.close',
    'is_closed': 'hours.tuesday.closed'
  },
  'wednesday': {
    'open': 'hours.wednesday.open',
    'close': 'hours.wednesday.close',
    'is_closed': 'hours.wednesday.closed'
  },
  'thursday': {
    'open': 'hours.thursday.open',
    'close': 'hours.thursday.close',
    'is_closed': 'hours.thursday.closed'
  },
  'friday': {
    'open': 'hours.friday.open',
    'close': 'hours.friday.close',
    'is_closed': 'hours.friday.closed'
  },
  'saturday': {
    'open': 'hours.saturday.open',
    'close': 'hours.saturday.close',
    'is_closed': 'hours.saturday.closed'
  }
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
        let docs = yield Food
          .find(filter, '-__v -_id -hours._id')
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

  if (part.indexOf('!') === 0) {
    // Negation
    part = {
      operator: '!',
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
    if (part.operator === '-') {
      part.value = -part.value
    }
  }

  if (['lat', 'lng'].indexOf(key) > -1) {
    // Numbers and arrays of Numbers
    if (part.operator === '!') {
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
  } else if ('open'.indexOf(key) > -1) {
    if (part.value.indexOf(')') > -1 && part.value.indexOf('(') > -1)  {
      let day = part.value.substring(0, part.value.indexOf('('))
      let bound = part.value.substring(part.value.indexOf('(') + 1, part.value.indexOf(')'))
      let hr, lower, upper

      if (bound.indexOf('|') > -1) {
        lower = parseFloat(bound.split('|')[1])
        upper = parseFloat(bound.split('|')[0])
      } else if (bound.indexOf('>') > -1 || bound.indexOf('<') > - 1) {
        hr = parseFloat(bound.slice(1))
      } else {
        hr = parseFloat(bound)
      }

      response.query[ABSOLUTE_KEYMAP[day]['open']] = { $lt: lower || hr }
      response.query[ABSOLUTE_KEYMAP[day]['close']] = { $gt: upper || hr }
    } else {
      let checkOpen = part.operator !== '-'
      if (ABSOLUTE_KEYMAP.hasOwnProperty(part.value)) {
        response.query[ABSOLUTE_KEYMAP[part.value]['is_closed']] = { $ne: checkOpen }
      }
    }
  } else {
    // Strings

    if (part.operator === '!') {
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
