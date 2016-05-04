import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Textbook from '../../src/api/textbooks/model'

test.cb.before('setup', t => {
  // Drop all documents
  Textbook.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Textbook.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks')
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
    .get('/1.0/textbooks?limit=0')
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
    .get('/1.0/textbooks?limit=2')
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
    .get('/1.0/textbooks?limit=200')
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
    .get('/1.0/textbooks?skip=10')
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
    .get('/1.0/textbooks?skip=200')
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
    .get('/1.0/textbooks?skip=2&limit=2')
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
    .get(`/1.0/textbooks/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/0002', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/0002')
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
    .get('/1.0/textbooks/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q="Organic Chemistry"', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/search?q=%22Organic%20Chemistry%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.title.match('Organic Chemistry') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=loremipsumdolorsitamet', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/search?q=loremipsumdolorsitamet')
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
    .get('/1.0/textbooks/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=price:>330', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=price%3A%3E330')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.title.match('Design Of Analog Cmos Integrated Circuits')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=author:%22milton%22', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=author:%22milton%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.isbn.match('9780072468366') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=edition:<=5', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=edition:<=5&limit=20')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.edition <= 5 }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=edition:7', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=edition:7')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.title.match('Scientific Revolutions') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=course_code:%22NEW%22%20AND%20price:%3C16.50', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=course_code:%22NEW%22%20AND%20price:%3C16.50')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.id.match('10561713') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=course_requirement:!%22required%22%20AND%20course_requirement:!%22referenced%22', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=course_requirement:!%22required%22%20AND%20course_requirement:!%22referenced%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.title.match('Judaism: Revelation And Tradition')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=price:%3E%3D320', t => {
  request(cobalt.Server)
    .get('/1.0/textbooks/filter?q=price:%3E%3D320')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.id.match('10554272') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Textbook.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
