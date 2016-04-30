import Parking from '../model'
import co from 'co'

export default function search(req, res, next) {
  co(function* () {
    try {
      let docs = yield Parking
        .find({ $text: { $search: req.query.q } }, '-__v -_id')
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
