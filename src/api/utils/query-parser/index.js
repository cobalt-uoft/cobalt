class QueryParser {

  /*
    Tokenize the input query, and then parse the tokens into a
    MongoDB-compatible format.
  */
  static parseQuery (query, keyMap) {
    let response = {}

    // Split query into tokens
    let q = QueryParser.tokenize(query)

    // Start Mongo-DB compatible filter
    let filter = { $and: [] }

    // Parse each token
    for (let i = 0; i < q.length; i++) {
      filter.$and[i] = { $or: [] }
      for (let j = 0; j < q[i].length; j++) {
        q[i][j] = QueryParser.parseToken(q[i][j])

        // Verify that the key is valid
        if (!keyMap.hasOwnProperty(q[i][j].key)) {
          let err = new Error(`Filter key \`${q[i][j].key}\` is not supported.`)
          err.status = 400
          throw err
        }

        // Form Mongo-DB compatible filter from key type
        let query = {}
        switch (keyMap[q[i][j].key].type) {
          case 'string':
            query = QueryParser.stringQuery(q[i][j].filter)
            break
          case 'number':
            query = QueryParser.numberQuery(q[i][j].filter)
            break
          case 'date':
            if (!QueryParser.isValidDate(q[i][j].filter.value)) {
              let err = new Error('Invalid date format.')
              err.status = 400
              throw err
            }
            query = QueryParser.numberQuery(q[i][j].filter)
            break
          case 'time':
            q[i][j].filter.value = QueryParser.timeToNumber(q[i][j].filter.value)
            query = QueryParser.numberQuery(q[i][j].filter)
            break
        }

        filter.$and[i].$or[j] = {}
        filter.$and[i].$or[j][keyMap[q[i][j].key].value] = query
        if (keyMap[q[i][j].key].relativeValue) {
          response.mapReduce = true
        }
      }
    }

    response.tokens = q
    response.filter = filter
    return response
  }

  /*
    Split query into individual tokens.
  */
  static tokenize (query) {
    let pieces = query.split(' AND ')

    for (let i = 0; i < pieces.length; i++) {
      pieces[i] = pieces[i].trim().split(' OR ')
      for (let j = 0; j < pieces[i].length; j++) {
        pieces[i][j] = pieces[i][j].trim()
      }
    }

    return pieces
  }

  /*
    Parse token to retrieve key and filter information.
  */
  static parseToken (token) {
    let response = {}

    response = {
      raw: token,
      key: token.slice(0, token.indexOf(':')).trim(),
      filter: token.slice(token.indexOf(':') + 1).trim()
    }

    if (response.filter.indexOf('!') === 0) {
      // Negation
      response.filter = {
        operator: '!',
        value: response.filter.substring(1)
      }
    } else if (response.filter.indexOf('>=') === 0) {
      response.filter = {
        operator: '>=',
        value: response.filter.substring(2)
      }
    } else if (response.filter.indexOf('<=') === 0) {
      response.filter = {
        operator: '<=',
        value: response.filter.substring(2)
      }
    } else if (response.filter.indexOf('>') === 0) {
      response.filter = {
        operator: '>',
        value: response.filter.substring(1)
      }
    } else if (response.filter.indexOf('<') === 0) {
      response.filter = {
        operator: '<',
        value: response.filter.substring(1)
      }
    } else {
      response.filter = {
        operator: undefined,
        value: response.filter
      }
    }

    if (isNaN(parseFloat(response.filter.value)) || !isFinite(response.filter.value)) {
      // Is not a number
      response.filter.value = response.filter.value.substring(1,
        response.filter.value.length - 1)
    } else {
      response.filter.value = parseFloat(response.filter.value)
    }

    return response
  }

  /*
    Form the MongoDB-compatible query for strings.
  */
  static stringQuery (filter) {
    if (filter.operator === '!') {
      return {
        $regex: '^((?!' + escapeRe(filter.value) + ').)*$',
        $options: 'i'
      }
    }
    return { $regex: '(?i).*' + escapeRe(filter.value) + '.*' }
  }

  /*
    Form the MongoDB-compatible query for numbers.
  */
  static numberQuery (filter) {
    if (filter.operator === '>') {
      return { $gt: filter.value }
    } else if (filter.operator === '<') {
      return { $lt: filter.value }
    } else if (filter.operator === '>=') {
      return { $gte: filter.value }
    } else if (filter.operator === '<=') {
      return { $lte: filter.value }
    } else if (filter.operator === '!') {
      return { $ne: filter.value }
    } else {
      return filter.value
    }
  }

  /*
    Verify that the date is in a correct format.
  */
  static isValidDate (value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
  }

  /*
    Convert a Cobalt time format to a number.
  */
  static timeToNumber (value) {
    let err = new Error ('Invalid time parameter.')
    err.status = 400

    if (typeof value !== 'number' && value.indexOf(':') > -1) {
      // TODO: add period support (AM/PM)
      // Time formatted as 'HH:MM:SS' or 'HH:MM'
      let timeValue = value.split(':')
      let time = 0

      for (let i = 0; i < Math.min(timeValue.length, 3); i++) {
        if (isNaN(parseInt(timeValue[i]))) {
          throw err
        }

        time += parseInt(timeValue[i]) * Math.pow(60, 2 - i)
      }

      value = time
    } else if (typeof value !== 'number') {
      throw err
    }
    return value
  }

}

function escapeRe (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

export default QueryParser
