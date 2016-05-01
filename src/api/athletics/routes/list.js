import Athletics from '../model'
import co from 'co'

export default function list(req, res, next) {
  co(function* () {
    try {
      let docs = yield Athletics
        .find({}, '-__v -_id -events._id -date_num')
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
