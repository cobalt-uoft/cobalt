import Textbook from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Textbook
        .findOne({ id: req.params.id },
          '-__v -_id -courses._id -courses.meeting_sections._id')
        .exec()
      if (!doc) {
        let err = new Error(
          'A textbook with the specified identifier does not exist.')
        err.status = 404
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
