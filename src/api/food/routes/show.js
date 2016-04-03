import Food from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Food
        .findOne({ id: req.params.id }, '-__v -_id -hours._id')
        .exec()
      if (!doc) {
        let err = new Error('A restaurant with the specified identifier does not exist.')
        err.status = 400
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
