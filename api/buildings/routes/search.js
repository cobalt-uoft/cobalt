var Building = require('../model')

var limit = 10
var skip = 0

var main = function(req, res) {
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

  if(req.query.q.length < 2) {
    return res.json({
      'error': {
        'code': 0,
        'message': 'Query must be of at least length 2.'
      }
    })
  }

  /* TODO: utilize promises and async control flow */
  Building.find({
    $text: {
      $search: req.query.q
    }
  }).skip(qSkip).limit(qLimit).exec(function(err, docs) {
    res.json(docs)
  })
}

module.exports = main
