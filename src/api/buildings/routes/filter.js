import Building from '../model'
import co from 'co'

// The flat keymap
const KEYMAP = {
  'code': 'code',
  'name': 'name',
  'short_name': 'short_name',
  'campus': 'campus',
  'street': 'street',
  'city': 'city',
  'country': 'country',
  'postal': 'postal',
  'lat': 'lat',
  'lng': 'lng',
  'polygon': 'polygon'
}

// The absolute (from root) keymap
const ABSOLUTE_KEYMAP = {
  'code': 'code',
  'name': 'name',
  'short_name': 'short_name',
  'campus': 'campus',
  'street': 'address.street',
  'city': 'address.city',
  'country': 'address.country',
  'postal': 'address.postal',
  'lat': 'lat',
  'lng': 'lng',
  'polygon': 'polygon'
}

export default function filter(req, res, next) {
  let q = req.query.q
  q = q.split(' AND ')

  let queries = 0

  let filter = { $and: q }

  for (let i = 0; i < filter.$and.length; i++) {
    filter.$and[i] = { $or: q[i].trim().split(' OR ') }

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
        let docs = yield Building
          .find(filter, '-__v -_id -address._id')
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
  } else if (key === 'polygon') {
    // TODO: Arrays of [Number, Number]

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
