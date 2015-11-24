import Building from '../model'
import co from 'co'

// Default values
let limit = 10
let skip = 0
let sort = 'id'

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

  let qSort = sort
  if (req.query.sort) {
    if (req.query.sort.length < 2) {
      let err = new Error('Sort must be a string of length greater than 1.')
      err.status = 400
      return next(err)
    }
    qSort = req.query.sort
  }

  co(function* (){
    try {
      let docs = yield Building.find({ $text: { $search: req.query.q } }, '-__v -_id -_address._id').skip(qSkip).limit(qLimit).sort(qSort).exec()
      res.json(docs)
    } catch(e) {
      next(e)
    }
  })

}
