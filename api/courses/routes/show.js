import Course from '../model'
import assert from 'assert'
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
    try {
      var doc = yield Course.findOne({ id: req.params.id }, '-_id').exec()
      if (!doc) {
        return res.json({
          'error': {
            'code': 0,
            'message': 'Does not exist.'
          }
        })
      } else {
        res.json(doc)
      }
    } catch(e) {
      assert.ifError(e)
    }
  })
}
