import test from 'ava'
import request from 'supertest'

import cobalt from '../../src/index'

test.cb('/labs', t => {
  request(cobalt.Server)
    .get('/1.0/cdf/labs')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/printers', t => {
  request(cobalt.Server)
    .get('/1.0/cdf/printers')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/labs?path=abc.json', t => {
  request(cobalt.Server)
    .get('/1.0/cdf/labs?path=abc.json')
    .expect('Content-Type', /json/)
    .expect(500)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/labs?path=abc.json', t => {
  request(cobalt.Server)
    .get('/1.0/cdf/printers?path=abc.json')
    .expect('Content-Type', /json/)
    .expect(500)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})
