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

test.cb('/search?q=%22bright,%20vibrant%20hub%20of%20social%20and%20academic%20activity%22', t => {
  request(cobalt.Server)
    .get('/1.0/food/search?q=%22bright,%20vibrant%20hub%20of%20social%20and%20academic%20activity%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.name.match('Kelly Cafe') }))
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

test.cb('/filter?q=open:%22sunday%22', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22sunday%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return !doc.hours.sunday.closed }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=open:%22monday(22.5|23.5)%22', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=open:%22monday(22.5|23.5)%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {return doc.id.match('1150') || doc.id.match('1189')}))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=tag:%22innis%22', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=tag:%22innis%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.tags.indexOf('innis') > -1 }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:!%22UTSG%22', t => {
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

test.cb('/filter?q=lng:<=-79.05%20AND%20lat:>=43.1', t => {
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

test.cb('/filter?q=lng:<-79.05%20AND%20lat:>43.1', t => {
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

test.cb('/filter?q=lng:-79.66178%20AND%20lat:43.54807', t => {
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

test.cb('/filter?q=address:%22st.%20george%22%20AND%20open:%22monday(>14)%22%20OR%20open:%22sunday%22', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=address:%22st.%20george%22%20AND%20open:%22monday(>14)%22%20OR%20open:%22sunday%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.name.match('Café Reznikoff') }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=address:"1265%20Military%20Trail"%20AND%20open:"sunday(9.75)"', t => {
  request(cobalt.Server)
    .get('/1.0/food/filter?q=address:"1265%20Military%20Trail"%20AND%20open:"sunday(9.75)"')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => { return doc.id.match('1231') }))
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
