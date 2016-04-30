import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Exams from '../../src/api/exams/model'

test.cb.before('setup', t => {
  // Drop all documents
  Exams.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Exams.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/exams')
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
    .get('/1.0/exams?limit=0')
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
    .get('/1.0/exams?limit=2')
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
    .get('/1.0/exams?limit=200')
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
    .get('/1.0/exams?skip=10')
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
    .get('/1.0/exams?skip=200')
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
    .get('/1.0/exams?skip=2&limit=2')
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
    .get(`/1.0/exams/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb(`/${testData[0].id}`, t => {
  request(cobalt.Server)
    .get(`/1.0/exams/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/CSC165', t => {
  request(cobalt.Server)
    .get('/1.0/exams/CSC165')
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
    .get('/1.0/exams/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=DEC15', t => {
  request(cobalt.Server)
    .get('/1.0/exams/search?q=DEC15')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.period.match('DEC15')).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=DEC14', t => {
  request(cobalt.Server)
    .get('/1.0/exams/search?q=DEC14')
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
    .get('/1.0/exams/filter?q=')
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
    .get('/1.0/exams/filter?q=campus:%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.campus.match('UTM')).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:-"utm"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=campus:-%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => !doc.campus.match('UTM')).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm" OR campus:"utsc" OR campus:"utsg"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=campus:%22utm%22%20OR%20campus:%22utsc%22%20OR%20campus:%22utsg%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=period:"APR16"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=period:%22APR16%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.period.match('APR16')).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=code:"ECO100"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=code:%22ECO100%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.course_code.includes('ECO100')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=code:"ECO100" AND lecture:"L0201"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=code:%22ECO100%22%20AND%20lecture:%22L0201%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter((doc) => doc.course_code.includes('ECO100'))
      expected['matched_sections'] = [
        {
          lecture_code: 'L0201',
          exam_section: 'A - GA',
          location: 'BN 3'
        },
        {
          lecture_code: 'L0201',
          exam_section: 'GE - Y',
          location: 'EX 100'
        },
        {
          lecture_code: 'L0201',
          exam_section: 'Z - Z',
          location: 'EX 200'
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

test.cb('/filter?q=date:"2016-04-28"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=date:%222016-04-28%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.id.match('CHM343H1S20161APR16')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:>=1461988800', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=date:%3E=1461988800')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:<="2016,04,30"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=date:%3E=%222016,04,30%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:<10800', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=duration:%3C10800')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.duration < 10800).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:<=10800', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=duration:%3C=10800')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:-7200', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=duration:-7200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.duration !== 7200).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=location:"HI CART"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=location:%22HI%20CART%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.id.match('ENG364Y1Y20159APR16'))
      expected['matched_sections'] = [{
        lecture_code: 'L5101',
        exam_section: '',
        location: 'HI CART'
      }]
      return expected
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:79200 OR end:79200', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=start:79200%20OR%20end:79200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.start_time === 79200 || doc.end_time === 79200))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:>50000 AND end:<62000 AND location:"SS"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=start:%3E50000%20AND%20end:%3C62000%20AND%20location:%22SS%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(() => {
      let expected = testData.filter(doc => doc.id.match('ABS201Y1Y20159APR16'))
      expected['matched_sections'] = [
        {
          lecture_code: '',
          exam_section: 'A - L',
          location: 'SS 2102'
        },
        {
          lecture_code: '',
          exam_section: 'M - Z',
          location: 'SS 2135'
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

test.cb('/filter?q=date:"today"', t => {
  request(cobalt.Server)
    .get('/1.0/exams/filter?q=date:%22today22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Exams.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
