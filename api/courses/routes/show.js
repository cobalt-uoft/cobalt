import Course from '../model'
import co from 'co'

export default function get(req, res) {
  if (!req.params.id) {
    return res.json({
      'error': {
        'code': 0,
        'message': 'Does not exist.'
      }
    })
  }

  co(function* (){
    var doc = yield Course.findOne({ id: req.params.id }).exec()
    res.json(doc)
  }).catch(err => {
    res.json(err)
  })
}
