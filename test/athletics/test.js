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

// /* show tests */

test.cb(`/${testData[0].date}`, t => {
  request(cobalt.Server)
    .get(`/1.0/athletics/${testData[0].date}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/2016-04-02', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/2016-04-02')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.date.match('2016-04-02T00:00:00.000Z'))[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/2018-04-02', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/2018-04-02')
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

test.cb('/search?q=utm', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=utm')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
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

test.cb('/filter?q=date:"2016-04-01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%222016-04-01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.date.includes('2016-04-01')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2017,04,01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%222017,04,01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm" AND date:"2016-04-03"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22%20AND%20date:%222016-04-03%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.date.includes('2016-04-03'))
      expected['matched_events'] = [{
        title: 'Fun Swim',
        campus: 'UTM',
        location: 'Pool',
        building_id: '332',
        start_time: 51000,
        end_time: 61200,
        duration: 10200
      }]
      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:-"utm" AND date:"2016-04-03"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:-%22UTM%22%20AND%20date:%222016-04-03%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.date.includes('2016-04-03'))
      expected['matched_events'] = [
        {
          title: 'Basketball',
          campus: 'UTSC',
          location: 'Gym 2',
          building_id: '208',
          start_time: 21600,
          end_time: 36000,
          duration: 14400
        },
        {
          title: 'Muscleworks',
          campus: 'UTSC',
          location: 'Studio 1',
          building_id: '208',
          start_time: 32400,
          end_time: 35400,
          duration: 3000
        },
        {
          title: 'Yoga',
          campus: 'UTSC',
          location: 'Studio 1',
          building_id: '208',
          start_time: 36000,
          end_time: 39000,
          duration: 3000
        },
        {
          title: 'Zumba',
          campus: 'UTSC',
          location: 'Studio 1',
          building_id: '208',
          start_time: 39600,
          end_time: 42600,
          duration: 3000
        },
        {
          title: 'Drop-In Climbing',
          campus: 'UTSC',
          location: 'Climbing Wall',
          building_id: '208',
          start_time: 43200,
          end_time: 54000,
          duration: 10800
        },
        {
          title: 'Basketball',
          campus: 'UTSC',
          location: 'Gym 2',
          building_id: '208',
          start_time: 43200,
          end_time: 68400,
          duration: 25200
        },
        {
          title: 'Barre',
          campus: 'UTSC',
          location: 'Studio 1',
          building_id: '208',
          start_time: 46800,
          end_time: 49800,
          duration: 3000
        },
        {
          title: 'Yoga',
          campus: 'UTSC',
          location: 'Studio 1',
          building_id: '208',
          start_time: 50400,
          end_time: 53400,
          duration: 3000
        }
      ]
      return expected
    })
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

test.cb('/filter?q=title:"rock climbing" AND date:>=1461816000000', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=title:%22rock%20climbing%22%20AND%20date:%3E=1461816000000')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.date.includes('2016-04-29'))

      expected['matched_events'] = [{
        title: 'Rock Climbing Club',
        campus: 'UTSC',
        location: 'Climbing Wall',
        building_id: '208',
        start_time: 43200,
        end_time: 52200,
        duration: 9000
      }]

      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:>"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%3E%222016%22')
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
    .get('/1.0/athletics/filter?q=date:%3C%222016%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:-1461470262870', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:-146147026287')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"today"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%22today22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:>=0', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%3E=0')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.slice(0, 10)

      expected.forEach((doc, i, docs) => {
        docs[i]['matched_events'] = docs[i]['events']
      })

      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:<"5:30" AND date:<="2016-04-12"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%3C%225:30%22%20AND%20date:%3C=%222016-04-12%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => {
        return doc.date.includes('2016-04-11') || doc.date.includes('2016-04-12')
      })
      expected.forEach((doc, i, docs) => {
        docs[i]['matched_events'] = [{
          title: 'Deep Water Lane Swim',
          campus: 'UTSC',
          location: 'Aquatics',
          building_id: '208',
          start_time: 18000,
          end_time: 32400,
          duration: 14400
        }]
      })
      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:<19800 AND date:<="2016-04-12"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%3C19800%20AND%20date:%3C=%222016-04-12%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.date.includes('2016-04-11') || doc.date.includes('2016-04-12'))
      expected.forEach((doc, i, docs) => {
        docs[i]['matched_events'] = [{
          title: 'Deep Water Lane Swim',
          campus: 'UTSC',
          location: 'Aquatics',
          building_id: '208',
          start_time: 18000,
          end_time: 32400,
          duration: 14400
        }]
      })
      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:<1800 OR duration:>38400', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=duration:%3C1800%20OR%20duration:%3E38400')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:>=38400', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=duration:%3E=38400')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => {
        return ['2016-04-06T00:00:00.000Z',
                '2016-04-07T00:00:00.000Z',
                '2016-04-13T00:00:00.000Z',
                '2016-04-14T00:00:00.000Z',
                '2016-04-20T00:00:00.000Z',
                '2016-04-21T00:00:00.000Z',
                '2016-04-27T00:00:00.000Z',
                '2016-04-28T00:00:00.000Z'].indexOf(doc.date) > -1
      })

      expected.forEach((doc, i, docs) => {
        docs[i]['matched_events'] = [{
          title: 'Basketball',
          campus: 'UTSC',
          location: 'Gym 1',
          building_id: '208',
          start_time: 46800,
          end_time: 85200,
          duration: 38400
        }]
      })

      return expected
    })
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
