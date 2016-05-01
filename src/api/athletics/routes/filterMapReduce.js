let o = {}

o.map = function() {
  let matchedEvents = []

  for (let h = 0; h < this.events.length; h++) {
    delete this.events[h]._id

    let s = this.events[h]

    let currentData = []

    for (let i = 0; i < data.length; i++) {
      currentData[i] = []

      for (let j = 0; j < data[i].length; j++) {
        currentData[i][j] = false
        let p = data[i][j]
        let value = s[p.key]

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
          if (p.value.constructor === Date || !isNaN(value)) {
            currentData[i][j] = value === p.value
          } else {
            currentData[i][j] = value.toLowerCase().includes(p.value.toLowerCase())
          }
        }
      }
    }

    for (let i = 0; i < currentData.length; i++) {
      currentData[i] = currentData[i].some(Boolean)
    }

    currentData = currentData.every(Boolean)

    if (currentData) {
      matchedEvents.push(s)
    }
  }

  if (matchedEvents.length > 0) {
    this.matched_events = matchedEvents
    delete this._id
    delete this.__v
    delete this.date_num
    emit(this.date, this)
  }
}

o.reduce = function(key, values) {
  values[0]
}

export default o
