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
          let err = new Error(`Filter key '${q[i][j].key}' is not supported.`)
          err.status = 400
          response.error = err
          return response
        }
        // Form Mongo-DB compatible filter from key type
        filter.$and[i].$or[j] = {}
        filter.$and[i].$or[j][keyMap[q[i][j].key].value] = keyMap[q[i][j].key].type(q[i][j].filter)
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

    if (response.filter.indexOf('-') === 0) {
      // Negation
      response.filter = {
        operator: '-',
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
    Form the MongoDB-compatible filter for strings.
  */
  static String (filter) {
    if (filter.operator === '-') {
      return {
        $regex: '^((?!' + escapeRe(filter.value) + ').)*$',
        $options: 'i'
      }
    }
    return { $regex: '(?i).*' + escapeRe(filter.value) + '.*' }
  }

  /*
    Form the MongoDB-compatible filter for numbers.
  */
  static Number (filter) {
    if (filter.operator === '>') {
      return { $gt: filter.value }
    } else if (filter.operator === '<') {
      return { $lt: filter.value }
    } else if (filter.operator === '>=') {
      return { $gte: filter.value }
    } else if (filter.operator === '<=') {
      return { $lte: filter.value }
    } else if (filter.operator === '-') {
      return -filter.value
    } else {
      // Assume equality if no operator
      return filter.value
    }
  }

  /*
    Form the MongoDB-compatible filter for dates.
  */
  static Date (filter) {

  }

  /*
    Form the MongoDB-compatible filter for times.
  */
  static Time (filter) {

  }

}

function escapeRe (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

export default QueryParser
