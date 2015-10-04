import Building from '../model'
import assert from 'assert'
import co from 'co'

var limit = 10
var skip = 0

export default function get(req, res) {
  var qLimit = limit
  if(req.query.limit) {
    if(req.query.limit > 100) {
      return res.json({
        'error': {
          'code': 0,
          'message': 'Limit must be less than or equal to 100.'
        }
      })
    }
    qLimit = req.query.limit
  }

  var qSkip = skip
  if(req.query.skip) {
    qSkip = req.query.skip
  }

  var qFilter = {}
  if(req.query.campus) {
    let campus = req.query.campus.toUpperCase()
    if(['UTSG', 'UTSC', 'UTM'].indexOf(campus) > -1) {
      qFilter.campus = campus
    }
  }

  co(function* (){
    var docs
    try {
      docs = yield Building.find(qFilter, '-_id').skip(qSkip).limit(qLimit).exec()
    } catch(e) {
      assert.ifError(e)
    }
    res.json(docs)
  })
}
