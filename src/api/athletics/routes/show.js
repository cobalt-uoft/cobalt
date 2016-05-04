import Athletics from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Athletics
        .findOne({ date: req.params.date }, '-__v -_id -events._id')
        .exec()
      if (!doc) {
        let err = new Error('An entry with the specified identifier does not exist.')
        err.status = 400
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
