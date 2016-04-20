import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Athletics from '../../src/api/athletics/model'

test.cb.before('setup', t => {
  // Drop all documents
  Athletics.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Athletics.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/athletics')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=0', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=0')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=2', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 2))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=200', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=200')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=10', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=10')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(10, 20))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=200', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=2&limit=2', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=2&limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(2, 4))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* show tests */

test.cb(`/${testData[0].id}`, t => {
  request(cobalt.Server)
    .get(`/1.0/athletics/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/01', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/01')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* search tests */

test.cb('/search?q=', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=barre', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=barre')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.match('07SC') || doc.id.match('14SC') || doc.id.match('21SC')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=utsg', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=utsg')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* filter tests */

test.cb('/filter?q=', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {return doc.id.includes('M')}).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:-"utm"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:-%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {return doc.id.includes('SC')}).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm" AND campus:"utsc" OR campus:"utsg"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22%20AND%20campus:%22utsc%22%20OR%20campus:%22utsg%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=title:"rock climbing" AND date:"2016,04,04"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=title:%22rock%20climbing%22%20AND%20date:%222016,04,04%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter((doc, i, data) => {
        return doc.id === '04SC'
      })

      expected['matched_events'] = [{
        title: 'Rock Climbing Club',
        location: 'Climbing Wall',
        building_id: '208',
        start_time: '2016-04-04T18:00:00.000Z',
        end_time: '2016-04-04T20:30:00.000Z'
      }]

      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})



test.cb('/filter?q=date:"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:>%222016%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:<"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:<%222016%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2016,04,01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%222016,04,01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:<"2016,04,02,13"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%3C%222016,04,02,13%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter((doc, i, data) => {
        return doc.id === '02SC'
      })

      expected['matched_events'] = [{
        title: 'Zumba',
        location: 'Studio 2',
        building_id: '208',
        start_time: '2016-04-02T12:00:00.000Z',
        end_time: '2016-04-02T12:50:00.000Z'
      }]

      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:-"2016,04,02"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:-%222016,04,02%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(1, 11))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})


test.cb('/filter?q=location:"gym" AND end:<="2016,04,11,13" AND start:>="2016,04,10"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=location:%22gym%22%20AND%20end:%3C=%222016,04,11,13%22%20AND%20start:%3E=%222016,04,10%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter((doc, i, data) => {
        return doc.id === '11SC'
      })

      expected['matched_events'] = [{
        title: 'Badminton/Table Tennis',
        location: 'Gym 4',
        building_id: '208',
        start_time: '2016-04-11T10:00:00.000Z',
        end_time: '2016-04-11T13:00:00.000Z'
      }]

      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2016-04-01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%222016-04-0122')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Athletics.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})

