// Default values
const LIMIT = 10
const SKIP = 0
const SORT = 'id date'

let validation = {}

validation.limit = (req, res, next) => {
  if (req.query.limit) {
    if (isNaN(req.query.limit) || req.query.limit < 1 || req.query.limit > 100) {
      let err = new Error('Limit must be a positive integer greater than 1 and less than or equal to 100.')
      err.status = 400
      return next(err)
    }
    req.query.limit = parseInt(req.query.limit)
  } else {
    req.query.limit = LIMIT
  }
  next()
}

validation.skip = (req, res, next) => {
  if (req.query.skip) {
    if (isNaN(req.query.skip) || req.query.skip < 0) {
      let err = new Error('Skip must be a positive integer.')
      err.status = 400
      return next(err)
    }
    req.query.skip = parseInt(req.query.skip)
  } else {
    req.query.skip = SKIP
  }
  next()
}

validation.sort = (req, res, next) => {
  if (req.query.sort) {
    if (req.query.sort.length < 2) {
      let err = new Error('Sort must be a string of length greater than 1.')
      err.status = 400
      return next(err)
    }
  } else {
    req.query.sort = SORT
  }
  next()
}

validation.query = (req, res, next) => {
  if (!req.query.q) {
    let err = new Error('Query must be specified.')
    err.status = 400
    return next(err)
  } else if (req.query.q.length < 3) {
    let err = new Error('Query must be of length greater than 2.')
    err.status = 400
    return next(err)
  }
  next()
}

validation.filterQuery = (req, res, next) => {
  // TODO: Loosely validate the format of the filter query
  next()
}

validation.id = (req, res, next) => {
  next()
}

export default validation
