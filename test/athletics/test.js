import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Athletics from '../../src/api/athletics/model'

test.cb.before('setup', t => {
  // Drop all documents
  Athletics.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Athletics.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/athletics')
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
    .get('/1.0/athletics?limit=0')
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
    .get('/1.0/athletics?limit=2')
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
    .get('/1.0/athletics?limit=200')
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
    .get('/1.0/athletics?skip=10')
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
    .get('/1.0/athletics?skip=200')
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
    .get('/1.0/athletics?skip=2&limit=2')
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
    .get(`/1.0/athletics/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/01', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/01')
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
    .get('/1.0/athletics/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=barre', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=barre')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.match('07SC') || doc.id.match('14SC') || doc.id.match('21SC')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=utsg', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/search?q=utsg')
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
    .get('/1.0/athletics/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {return doc.id.includes('M')}).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:-"utm"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:-%22utm%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {return doc.id.includes('SC')}).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm" AND campus:"utsc" OR campus:"utsg"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22%20AND%20campus:%22utsc%22%20OR%20campus:%22utsg%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=title:"rock climbing"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=title:%22rock%20climbing%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      // TODO: find matches w/o hardcoding IDs
      return ['04SC', '05SC', '07SC', '14SC', '21SC'].indexOf(doc.id) > -1
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:>%222016%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:<"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:<%222016%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2016,04,01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%222016,04,01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:<="2016,04,02"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:<%222016,04,02%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return new Date(doc.date) >= new Date(2016, 4, 3)
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:-"2016,04,02"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:-"2016,04,02"')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(1, 11))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:>="2016,04,25,4"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:>=%222016,04,25,4%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.includes('25') || doc.id.includes('26')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"TEST"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%22TEST%22')
    .expect('Content-Type', /json/)
    .expect(500)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// test.cb.after('cleanup', t => {
//   Athletics.remove({}, err => {
//     if (err) t.fail(err.message)
//     t.end()
//   })
// })

