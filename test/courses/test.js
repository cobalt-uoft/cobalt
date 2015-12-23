import 'babel-core/register'
import test from 'ava'
import testData from './testData.json'
import request from 'supertest'
import app from '../../index'
import Course from '../../api/courses/model'

test.before('setup', t => {
  // Drop all documents
  Course.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Course.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test('/list', t => {
  request(app)
    .get('/1.0/courses/list')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?limit=0', t => {
  request(app)
    .get('/1.0/courses/list?limit=0')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?limit=2', t => {
  request(app)
    .get('/1.0/courses/list?limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 2)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?limit=200', t => {
  request(app)
    .get('/1.0/courses/list?limit=200')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?skip=10', t => {
  request(app)
    .get('/1.0/courses/list?skip=10')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(10, 20)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?skip=200', t => {
  request(app)
    .get('/1.0/courses/list?skip=200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?skip=2&limit=2', t => {
  request(app)
    .get('/1.0/courses/list?skip=2&limit=2')
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
    .get(`/1.0/courses/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData[0]))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/XYZ789H1F20159', t => {
  request(app)
    .get('/1.0/courses/XYZ789H1F20159')
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
    .get('/1.0/courses/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/search?q=%22recreational%20space%20and%20more%22', t => {
  request(app)
    .get('/1.0/courses/search?q=%22recreational%20space%20and%20more%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => { return doc.description.match('recreational space and more') })))
    .end((err, res) => {
      console.log(res)
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/search?q=loremipsumdolorsitamet', t => {
  request(app)
    .get('/1.0/courses/search?q=loremipsumdolorsitamet')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      console.log(res)
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* TODO: filter tests (fun) */

test('/filter?q=', t => {
  request(app)
    .get('/1.0/courses/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.after('cleanup', t => {
  Course.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
