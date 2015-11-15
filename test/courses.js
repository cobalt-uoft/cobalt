import 'babel-core/register'
import test from 'ava'
import request from 'supertest'
import app from '../index'
import Course from '../api/courses/model'

// TODO: Create 20 items in here [0 - 19] that can be used to effectively
// test all points of the course API
let testData = []

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

/* Tests for /list */

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
    .expect(200)
    .expect('[]')
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
    .expect(200)
    .expect('{"error":{"code":0,"message":"Limit must be less than or equal to 100."}}')
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

test.after('cleanup', t => {
  Course.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
