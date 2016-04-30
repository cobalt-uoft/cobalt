import Parking from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Parking
        .findOne({ id: req.params.id }, '-__v -_id')
        .exec()
      if (!doc) {
        let err = new Error('A parking lot with the specified identifier does not exist.')
        err.status = 400
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
