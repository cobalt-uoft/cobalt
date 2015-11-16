import 'babel-core/register'
import test from 'ava'
import request from 'supertest'
import app from '../../index'

test.before('setup', t => {
  // TODO: Drop all documents in buildings DB
  // TODO: Insert test data
  t.end()
})

test('/list', t => {
  // example
  request(app)
    .get('/1.0/buildings/list')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.after('cleanup', t => {
  // TODO: Drop all documents in buildings DB
  t.end()
})
