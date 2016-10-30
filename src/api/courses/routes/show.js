import Course from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Course
        .findOne({ id: req.params.id }, '-__v -_id -meeting_sections._id -meeting_sections.times._id')
        .exec()
      if (!doc) {
        let err = new Error('A course with the specified identifier does not exist.')
        err.status = 404
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
