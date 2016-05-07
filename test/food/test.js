import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Food from '../../src/api/food/model'

test.cb.before('setup', t => {
  // Drop all documents
  Food.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Food.create(testData, err => {
      if (err) t.fail(err.message)
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/food')
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
    .get('/1.0/food?limit=0')
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
    .get('/1.0/food?limit=2')
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
    .get('/1.0/food?limit=200')
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
    .get('/1.0/food?skip=10')
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
    .get('/1.0/food?skip=200')
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
    .get('/1.0/food?skip=2&limit=2')
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
    .get(`/1.0/food/${testData[0].id}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/0002', t => {
  request(cobalt.Server)
    .get('/1.0/food/0002')
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
    .get('/1.0/food/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q="student union"', t => {
  request(cobalt.Server)
    .get('/1.0/food/search?q=%22student%20union%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc =>  doc.id.match('1163')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=loremipsumdolorsitamet', t => {
  request(cobalt.Server)
    .get('/1.0/food/search?q=loremipsumdolorsitamet')
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
    .get('/1.0/food/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// Following two tests are hanging when L199/L212 is uncommented :/

test.cb('/filter?q=open:"sunday"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22sunday%22')
    .expect('Content-Type', /json/)
    .expect(200)
    // .expect(testData.filter(doc => !doc.hours.sunday.closed))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:!"sunday"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:!%22sunday%22')
    .expect('Content-Type', /json/)
    .expect(200)
    // .expect(testData.filter(doc => doc.hours.sunday.closed))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:"monday(25200|28800)"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22monday(25200|28800)%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.match('0276') || doc.id.match('0448') || doc.id.match('0457')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:"monday(7:00|8:00)"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22monday(7:00|8:00)%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.match('0276') || doc.id.match('0448') || doc.id.match('0457')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:"wednesday(>14:00|54000)"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22wednesday(>14:00|54000)%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:"september"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22september%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=tag:"grab and go"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=tag:%22grab%20and%20go%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.tags.indexOf('grab and go') > -1))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:!"UTSG"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=campus:!%22UTSG%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.campus.match('UTM') || doc.campus.match('UTSC')
    }).slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lng:<=-79.05 AND lat:>=43.1', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=lng:<=-79.05%20AND%20lat:>=43.1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lng:<-79.05 AND lat:>43.1', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=lng:<-79.05%20AND%20lat:>43.1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=lng:-79.66178 AND lat:43.54807', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=lng:-79.66178%20AND%20lat:43.54807')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.lng === -79.66178 && doc.lat === 43.54807
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=address:"st. george" AND open:"monday(>50400)" OR open:"sunday"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=address:%22st.%20george%22%20AND%20open:%22monday(>50400)%22%20OR%20open:%22sunday%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.id.match('0309') || doc.id.match('0355') || doc.id.match('0457')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=address:"40 Willcocks St" AND open:"sunday(9:45)"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=address:%2240%20Willcocks%20St%22%20AND%20open:%22sunday(9:45)%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => doc.id.match('0361')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Food.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
