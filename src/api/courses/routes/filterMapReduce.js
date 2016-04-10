let o = {}

o.map = function() {
  let matchedSections = []

  for (let h = 0; h < this.meeting_sections.length; h++) {

    delete this.meeting_sections[h]._id
    for (let i = 0; i < this.meeting_sections[h].times.length; i++) {
      delete this.meeting_sections[h].times[i]._id
    }

    let s = this.meeting_sections[h]

    let currentData = []

    for (let i = 0; i < data.length; i++) {
      currentData[i] = []

      for (let j = 0; j < data[i].length; j++) {
        currentData[i][j] = false
        let p = data[i][j]
        let value = undefined

        if (['code', 'size', 'enrolment', 'instructors'].indexOf(p.key) > -1) {
          value = s[p.key]
        } else if (['day', 'start', 'end', 'duration', 'location'].indexOf(p.key) > -1) {
          value = []
          for(let l = 0; l < s.times.length; l++) {
            value.push(s.times[l][p.key])
          }
        }

        if (value.constructor === Array) {
          let bools = []

          if (p.operator === '-') {
            for (let l = 0; l < value.length; l++) {
              bools.push(!value[l].match(p.value))
            }
          } else if (p.operator === '>') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] > p.value)
            }
          } else if (p.operator === '<') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] < p.value)
            }
          } else if (p.operator === '>=') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] >= p.value)
            }
          } else if (p.operator === '<=') {
            for (let l = 0; l < value.length; l++) {
              bools.push(value[l] <= p.value)
            }
          } else {
            for (let l = 0; l < value.length; l++) {
              if (!isNaN(value[l])) {
                bools.push(value[l] === p.value)
              } else {
                bools.push(value[l].match(p.value))
              }
            }
          }

          currentData[i][j] = bools.some(Boolean)
        } else {
          if (p.operator === '-') {
            currentData[i][j] = !value.match(p.value)
          } else if (p.operator === '>') {
            currentData[i][j] = value > p.value
          } else if (p.operator === '<') {
            currentData[i][j] = value < p.value
          } else if (p.operator === '>=') {
            currentData[i][j] = value >= p.value
          } else if (p.operator === '<=') {
            currentData[i][j] = value <= p.value
          } else {
            if (!isNaN(value)) {
              currentData[i][j] = value === p.value
            } else {
              currentData[i][j] = value.match(p.value)
            }
          }
        }
      }
    }

    for (let i = 0; i < currentData.length; i++) {
      currentData[i] = currentData[i].some(Boolean)
    }

    currentData = currentData.every(Boolean)

    if (currentData) {
      matchedSections.push(s)
    }
  }

  if (matchedSections.length > 0) {
    this.matched_meeting_sections = matchedSections
    delete this._id
    delete this.__v
    emit(this.id, this)
  }
}

o.reduce = function(key, values) {
  return values[0]
}

export default o
