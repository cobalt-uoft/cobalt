let o = {}

o.map = function () {
  let matched = []

  for (let h = 0; h < this.meeting_sections.length; h++) {
    let x = this.meeting_sections[h]

    let result = []

    // For each AND-type token
    for (let i = 0; i < q.length; i++) {
      result[i] = []

      // For each OR-type token
      for (let j = 0; j < q[i].length; j++) {
        result[i][j] = false
        let p = q[i][j]
        let value = undefined

        if (['code', 'size', 'enrolment', 'instructor'].indexOf(p.key) > -1) {
          value = x[keyMap[p.key].relativeValue]
        } else if (['day', 'start', 'end', 'duration', 'location'].indexOf(p.key) > -1) {
          value = []
          for(let l = 0; l < x.times.length; l++) {
            value.push(x.times[l][keyMap[p.key].relativeValue])
          }
        } else {
          result[i][j] = true
          continue
        }

        if (value.constructor === Array) {
          let bools = []

          if (p.filter.operator === '!') {
            for (let l = 0; l < value.length; l++) {
              if (isNaN(parseFloat(value[l])) || !isFinite(value[l])) {
                // Is not a number
                bools.push(!value[l].toLowerCase().match(p.filter.value.toLowerCase()))
              } else {
                bools.push(value[l] !== p.filter.value)
              }
            }
          } else if (p.filter.operator === '>') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] > p.filter.value)
            }
          } else if (p.filter.operator === '<') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] < p.filter.value)
            }
          } else if (p.filter.operator === '>=') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] >= p.filter.value)
            }
          } else if (p.filter.operator === '<=') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] <= p.filter.value)
            }
          } else {
            for (let l = 0; l < value.length; l++) {
              if (isNaN(parseFloat(value[l])) || !isFinite(value[l])) {
                // Is not a number
                bools.push(value[l].toLowerCase().match(p.filter.value.toLowerCase()))
              } else {
                bools.push(value[l] === p.filter.value)
              }
            }
          }

          result[i][j] = bools.some(Boolean)
        } else {
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
    this.matched_meeting_sections = matched
    delete this._id
    delete this.__v
    emit(this.id, this)
  }
}

o.reduce = function (key, values) {
  return values[0]
}

export default o
