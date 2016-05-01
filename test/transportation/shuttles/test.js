import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../../src/index'
import Shuttle from '../../../src/api/transportation/shuttles/model'

let expectedTestData = []

test.cb.before('setup', t => {
  // Drop all documents
  Shuttle.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Shuttle.create(testData, err => {
      if (err) t.fail(err.message)
      // Populate expectedTestData (remove `date_num`)
      for (let i = 0; i < testData.length; i++) {
        let doc = testData[i]
        delete doc.date_num
        expectedTestData.push(doc)
      }
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/shuttles')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=0', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/shuttles?limit=0')
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
    .get('/1.0/transportation/shuttles?limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(0, 2))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=200', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/shuttles?limit=200')
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
    .get('/1.0/transportation/shuttles?skip=10')
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
    .get('/1.0/transportation/shuttles?skip=200')
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
    .get('/1.0/transportation/shuttles?skip=2&limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(2, 4))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* show tests */

test.cb(`/${testData[0].date}`, t => {
  request(cobalt.Server)
    .get(`/1.0/transportation/shuttles/${testData[0].date}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/0002', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/shuttles/0002')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Shuttle.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
