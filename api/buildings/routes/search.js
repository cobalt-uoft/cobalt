import Building from '../model'
import co from 'co'

var limit = 10
var skip = 0

export default function get(req, res, next) {
  if (!req.query.q) {
    let err = new Error('Query must be specified.')
    err.status = 400
    return next(err)
  } else if (req.query.q.length < 3) {
    let err = new Error('Query must be of length greater than 2.')
    err.status = 400
    return next(err)
  }

  let qLimit = limit
  if (req.query.limit) {
    if (isNaN(req.query.limit) || req.query.limit < 1 || req.query.limit > 100) {
      let err = new Error('Limit must be a positive integer greater than 1 and less than or equal to 100.')
      err.status = 400
      return next(err)
    }
    qLimit = req.query.limit
  }

  let qSkip = skip
  if (req.query.skip) {
    if (isNaN(req.query.skip) || req.query.skip < 0) {
      let err = new Error('Skip must be a positive integer.')
      err.status = 400
      return next(err)
    }
    qSkip = req.query.skip
  }

  co(function* (){
    try {
      let docs = yield Building.find({
        $text: {
          $search: req.query.q
        }
      }, '-_id').skip(qSkip).limit(qLimit).sort('id').exec()
      res.json(docs)
    } catch(e) {
      next(e)
    }
  })

}
