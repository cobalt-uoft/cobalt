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

test('/list', t => {
  request(app)
    .get('/1.0/buildings/list')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end(function(err, res){
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.after('cleanup', t => {
  /*Building.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })*/
  t.end()
})
