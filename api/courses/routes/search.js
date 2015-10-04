import Course from '../model'
import assert from 'assert'
import co from 'co'

var limit = 10
var skip = 0

export default function get(req, res) {
  if(!req.query.q) {
    return res.json({
      'error': {
        'code': 0,
        'message': 'Query must be specified.'
      }
    })
  }

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

  if(req.query.q.length < 3) {
    return res.json({
      'error': {
        'code': 0,
        'message': 'Query must be of at least length 3.'
      }
    })
  }

  co(function* () {
    try {
      var docs = yield Course.find({
        $text: { $search: req.query.q }
      }, '-_id').skip(qSkip).limit(qLimit).exec()
      res.json(docs)
    } catch(e) {
      assert.ifError(e)
    }
  })
}
