import Shuttle from '../model'
import co from 'co'

export default function list(req, res, next) {
  co(function* () {
    try {
      let docs = yield Shuttle
        .find({}, '-__v -_id -routes._id -stops._id -times._id')
        .limit(req.query.limit)
        .skip(req.query.skip)
        .sort(req.query.sort)
        .exec()
      res.json(docs)
    } catch (e) {
      return next(e)
    }
  })
}
