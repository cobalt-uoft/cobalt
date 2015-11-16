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

// list tests

test('/list', t => {
  request(app)
    .get('/1.0/courses/list')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end(function(err, res){
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
    .end(function(err, res){
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
    .end(function(err, res){
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
    .end(function(err, res){
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
    .end(function(err, res){
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
    .end(function(err, res){
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
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?campus=UTM', t => {
  request(app)
    .get('/1.0/courses/list?campus=UTM')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => { return doc.campus === 'UTM' })))
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/list?campus=UTB', t => {
  request(app)
    .get('/1.0/courses/list?campus=UTB')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// show tests

test(`/show/${testData[0].id}`, t => {
  request(app)
    .get(`/1.0/courses/show/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData[0]))
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test('/show/XYZ789H1F20159', t => {
  request(app)
    .get('/1.0/courses/show/XYZ789H1F20159')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// search tests

// filter tests (fun)

test.after('cleanup', t => {
  Course.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
