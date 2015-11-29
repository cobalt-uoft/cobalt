import Building from '../model'
import co from 'co'

export default function list(req, res, next) {
  co(function* () {
    try {
      let docs = yield Building
        .find({}, '-__v -_id -address._id')
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
