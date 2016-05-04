let o = {}

o.map = function() {
  let matched = []

  for (let h = 0; h < this.events.length; h++) {
    delete this.events[h]._id

    let x = this.events[h]

    let result = []

    for (let i = 0; i < q.length; i++) {
      result[i] = []

      for (let j = 0; j < q[i].length; j++) {
        result[i][j] = false
        let p = q[i][j]

        let value = x[keyMap[p.key].relativeValue]
        if (value === undefined) {
          // Continue if value is not applicable
          result[i][j] = true
          continue
        }

        if (p.filter.operator === '!') {
          if (isNaN(parseFloat(value)) || !isFinite(value)) {
            // Is not a number
            result[i][j] = !value.toLowerCase().match(p.filter.value.toLowerCase())
          } else {
            result[i][j] = value !== p.filter.value
          }
        } else if (p.filter.operator === '>') {
          result[i][j] = value > p.filter.value
        } else if (p.filter.operator === '<') {
          result[i][j] = value < p.filter.value
        } else if (p.filter.operator === '>=') {
          result[i][j] = value >= p.filter.value
        } else if (p.filter.operator === '<=') {
          result[i][j] = value <= p.filter.value
        } else {
          if (isNaN(parseFloat(value)) || !isFinite(value)) {
            // Is not a number
            result[i][j] = value.toLowerCase().match(p.filter.value.toLowerCase())
          } else {
            result[i][j] = value === p.filter.value
          }
        }
      }
    }

    for (let i = 0; i < result.length; i++) {
      result[i] = result[i].some(Boolean)
    }

    result = result.every(Boolean)

    if (result) {
      matched.push(x)
    }
  }

  if (matched.length > 0) {
    this.matched_events = matched
    delete this._id
    delete this.__v
    emit(this.date, this)
  }
}

o.reduce = function(key, values) {
  values[0]
}

export default o
