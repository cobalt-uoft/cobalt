import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../../src/index'
import Parking from '../../../src/api/transportation/parking/model'

test.cb.before('setup', t => {
  // Drop all documents
  Parking.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Parking.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking')
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
    .get('/1.0/transportation/parking?limit=0')
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
    .get('/1.0/transportation/parking?limit=2')
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
    .get('/1.0/transportation/parking?limit=200')
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
    .get('/1.0/transportation/parking?skip=10')
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
    .get('/1.0/transportation/parking?skip=200')
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
    .get('/1.0/transportation/parking?skip=2&limit=2')
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
    .get(`/1.0/transportation/parking/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/0', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/0')
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
    .get('/1.0/transportation/parking/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// NOTE: text searches don't play well with numbers. I think it's time to start
// thinking of discontinuing the search endpoint in favour of using our own custom
// filter.
/*
test.cb('/search?q="32 post & ring stands"', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/search?q=32%20post%20%26%20ring%20stands')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.description.indexOf('32 post & ring stands') > -1 }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})
*/

test.cb('/search?q=loremipsumdolorsitamet', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/search?q=loremipsumdolorsitamet')
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
    .get('/1.0/transportation/parking/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:>=40', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lat%3A%3E%3D40')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=title:"Dentistry Building"', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=title%3A%22Dentistry%20Building%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.id === '0252' }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lng:<=-100', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lng%3A%3C%3D-100')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect([])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:43.66034 AND lng:-79.38876', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lat:43.66034 AND lng:-79.38876')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.title.match('Banting Institute') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:<1', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lat:<1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect([])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:>40', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lat:>40')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:>=40', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=lat:>=40')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=type:!"bicycle"', t => {
  request(cobalt.Server)
    .get('/1.0/transportation/parking/filter?q=type:!"bicycle"')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.type.match('car') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Parking.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
