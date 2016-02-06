import 'babel-core/register'
import test from 'ava'
import testData from './testData.json'
import request from 'supertest'
import app from '../../index'
import Building from '../../api/buildings/model'

test.before('setup', t => {
  // Drop all documents
  Building.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Building.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test('/', t => {
  request(app)
    .get('/1.0/buildings')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?limit=0', t => {
  request(app)
    .get('/1.0/buildings?limit=0')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?limit=2', t => {
  request(app)
    .get('/1.0/buildings?limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 2)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?limit=200', t => {
  request(app)
    .get('/1.0/buildings?limit=200')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?skip=10', t => {
  request(app)
    .get('/1.0/buildings?skip=10')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(10, 20)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?skip=200', t => {
  request(app)
    .get('/1.0/buildings?skip=200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/?skip=2&limit=2', t => {
  request(app)
    .get('/1.0/buildings?skip=2&limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(2, 4)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* show tests */

test(`/${testData[0].id}`, t => {
  request(app)
    .get(`/1.0/buildings/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData[0]))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/XYZ', t => {
  request(app)
    .get('/1.0/buildings/XYZ')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* search tests */

test('/search?q=', t => {
  request(app)
    .get('/1.0/buildings/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/search?q=Wallberg', t => {
  request(app)
    .get('/1.0/buildings/search?q=Wallberg')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => { return doc.name.match('Wallberg') })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/search?q=loremipsumdolorsitamet', t => {
  request(app)
    .get('/1.0/buildings/search?q=loremipsumdolorsitamet')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* TODO: filter tests */

test('/filter?q=', t => {
  request(app)
    .get('/1.0/buildings/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.after('cleanup', t => {
  Building.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
