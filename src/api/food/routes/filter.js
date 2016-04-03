import Food from '../model'
import co from 'co'

const ABSOLUTE_KEYMAP = {
  'name': 'name',
  'short_name': 'short_name',
  'campus': 'campus',
  'address': 'address',
  'lat': 'lat',
  'lng': 'lng',
  'tags': 'tags',
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

  if (['lat', 'lng'].indexOf(key) > -1) {
    // Numbers and arrays of Numbers

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
  } else if ('open'.indexOf(key) > -1) {
    let days = part.value.split(',')
    for (let i = 0; i < days.length; i++) {
      let day

      if (days[i].indexOf('(') > -1) {
        // Hour bound is provided
        day = days[i].substring(0, days[i].indexOf('('))
        let hours = days[i].substring(days[i].indexOf('(') + 1, days[i].length - 1)
        let hour, lower, upper

        if (hours.indexOf('|') > -1) {
          // Check if vendor is open between hour range
          lower = parseInt(hours.split('|')[1])
          upper = parseInt(hours.split('|')[0])
        } else if (hours.indexOf('>') > -1) {
          // Open after provided hour
          hour = parseInt(hours.slice(1))
        } else if (hours.indexOf('<') > -1) {
          // Open before provided hour
          hour = parseInt(hours.slice(1))
        } else {
          // Open at hour
          hour = parseInt(hours)
        }

        response.query[ABSOLUTE_KEYMAP[day]['open']] = { $lte: lower || hour }
        response.query[ABSOLUTE_KEYMAP[day]['close']] = { $gte: upper || hour }
      } else {
        // No hours provided, check if open at any time
        day = days[i]
        let val = true
        if (day.substr(0, 1) == '-') {
          day = day.substr(1)
          val = false
        }
        response.query[ABSOLUTE_KEYMAP[day]['is_closed']] = { $ne: val }
      }
    }
  } else if ('tags'.indexOf(key) > -1) {
    let tags = part.value.split(',')

    let contains = []
    let notContains = []

    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i].trim().toLowerCase()
      if (tag[0] === '-') {
        notContains.push(escapeRe(tag.substr(1)))
      } else {
        contains.push(escapeRe(tag))
      }
    }

    if (contains.length > 0 || notContains.length > 0) {
      response.query[ABSOLUTE_KEYMAP['tags']] = {}

      if (contains.length > 0) {
        response.query[ABSOLUTE_KEYMAP['tags']]['$all'] = contains
      }

      if (notContains.length > 0) {
        response.query[ABSOLUTE_KEYMAP['tags']]['$nin'] = notContains
      }
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
