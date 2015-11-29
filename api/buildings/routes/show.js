import Building from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Building
        .findOne({ id: req.params.id }, '-__v -_id -address._id')
        .exec()
      if (!doc) {
        let err = new Error('A building with the specified identifier does not exist.')
        err.status = 400
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
