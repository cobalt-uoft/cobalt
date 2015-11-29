import Course from '../model'
import co from 'co'

export default function get(req, res, next) {
  co(function* () {
    try {
      let docs = yield Course
        .find({}, '-__v -_id -meeting_sections._id -meeting_sections.times._id')
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
