import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Course from '../../src/api/courses/model'

test.cb.before('setup', t => {
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

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/courses')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(0, 10)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/course/')
    .expect('Content-Type', /json/)
    .expect(404)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=0', t => {
  request(cobalt.Server)
    .get('/1.0/courses?limit=0')
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
    .get('/1.0/courses?limit=2')
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
    .get('/1.0/courses?limit=200')
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
    .get('/1.0/courses?skip=10')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.slice(10, 20)))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=-5', t => {
  request(cobalt.Server)
    .get('/1.0/courses?skip=-5')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=200', t => {
  request(cobalt.Server)
    .get('/1.0/courses?skip=200')
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
    .get('/1.0/courses?skip=2&limit=2')
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

test.cb(`/${testData[0].id}`, t => {
  request(cobalt.Server)
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

test.cb('/XYZ789H1F20159', t => {
  request(cobalt.Server)
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

test.cb('/search?q=', t => {
  request(cobalt.Server)
    .get('/1.0/courses/search?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=%22recreational%20space%20and%20more%22', t => {
  request(cobalt.Server)
    .get('/1.0/courses/search?q=%22recreational%20space%20and%20more%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => { return doc.description.match('recreational space and more') })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=loremipsumdolorsitamet', t => {
  request(cobalt.Server)
    .get('/1.0/courses/search?q=loremipsumdolorsitamet')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/search?q=kk', t => {
  request(cobalt.Server)
    .get('/1.0/courses/search?q=kk')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* filter tests */

test.cb('/filter?q=', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=name:%22theory%22', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=name:%22theory%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => { return doc.code.includes('CSC236') })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=level:100%20OR%20name:%22econ%22', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=level:100%20OR%20name:%22econ%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => {
      return doc.code.includes('POL370') || doc.code.includes('SOC102')
    })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=level:>=400%20AND%20department:!%22bio%22%20AND%20campus:%22UTSG%22', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=level:>=400%20AND%20department:!%22bio%22%20AND%20campus:%22UTSG%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify(testData.filter(doc => {
      return doc.code.includes('GGR498') || doc.code.includes('RSM429') ||
        doc.code.includes('TRN421')
    })))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=level:<100', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=level:<100')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect([])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=breadth:<=1', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=breadth:<=1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(testData.filter(doc => {
      return doc.code.includes('EAS386') || doc.code.includes('MGR301') ||
        doc.code.includes('MHB256')
    }))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=size:15', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=size:15')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=size:>5000', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=size:>5000')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(res => {
      res.body[0].code = 'SOC102H1S'
    })
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=instructor:!"D Liu"', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=instructor:!"D Liu"')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=instructor:%22Brown%22', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=instructor:%22Brown%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=location:"BA"', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=location:"BA"')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:>"1:00"', t => {
  request(cobalt.Server)
    .get('/1.0/courses/filter?q=duration:>"1:00"')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Course.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
