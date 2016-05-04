import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Building from '../../src/api/buildings/model'

test.cb.before('setup', t => {
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

test.cb('/', t => {
  request(cobalt.Server)
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

test.cb('/?limit=0', t => {
  request(cobalt.Server)
    .get('/1.0/buildings?limit=0')
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

test.cb('/?limit=200', t => {
  request(cobalt.Server)
    .get('/1.0/buildings?limit=200')
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

test.cb('/?skip=200', t => {
  request(cobalt.Server)
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

test.cb('/?skip=2&limit=2', t => {
  request(cobalt.Server)
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

test.cb('/?sort=+', t => {
  request(cobalt.Server)
    .get('/1.0/buildings?sort=+')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* show tests */

test.cb(`/${testData[0].id}`, t => {
  request(cobalt.Server)
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

test.cb('/XYZ', t => {
  request(cobalt.Server)
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

test.cb('/search?q=', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=Wallberg', t => {
  request(cobalt.Server)
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

test.cb('/search?q=loremipsumdolorsitamet', t => {
  request(cobalt.Server)
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

/* filter tests */

test.cb('/filter?q=', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=name:%22library%22', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=name:%22library%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => {
      return doc.name.toLowerCase().includes('library')
    })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=code:%22UC%22%20OR%20code:%22HH%22', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=code:%22UC%22%20OR%20code:%22HH%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => {
      return doc.name.match('Hart House') || doc.name.match('University College')
    })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:>=43%20AND%20lng:<=-79.1', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=lat:>=43%20AND%20lng:<=-79.1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:>43%20AND%20lng:<-79.1', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=lat:>43%20AND%20lng:<-79.1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lat:43.65963205070242%20AND%20lng:-79.3946933827686', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=lat:43.65963205070242%20AND%20lng:-79.3946933827686')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id === '008A'
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:%22UTSG%22%20AND%20campus:!%22UTSG%22', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=campus:%22UTSG%22%20AND%20campus:!%22UTSG%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=ab:"cd"', t => {
  request(cobalt.Server)
    .get('/1.0/buildings/filter?q=ab:"cd"')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Building.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
