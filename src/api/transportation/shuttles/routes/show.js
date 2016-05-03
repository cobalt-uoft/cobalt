import Shuttle from '../model'
import co from 'co'

export default function show(req, res, next) {
  co(function* (){
    try {
      let doc = yield Shuttle
        .findOne({ date: req.params.date },
          '-__v -_id -routes._id -stops._id -times._id')
        .exec()
      if (!doc) {
        let err = new Error('An entry with the specified date does not exist.')
        err.status = 400
        return next(err)
      }
      res.json(doc)
    } catch (e) {
      return next(e)
    }
  })
}
