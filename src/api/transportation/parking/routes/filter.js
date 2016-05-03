import Parking from '../model'
import co from 'co'
import QueryParser from '../../../utils/query-parser'

const KEYMAP = {
  'id':          { type: 'string', value: 'id' },
  'title':       { type: 'string', value: 'title' },
  'building_id': { type: 'string', value: 'building_id' },
  'campus':      { type: 'string', value: 'campus' },
  'type':        { type: 'string', value: 'type' },
  'description': { type: 'string', value: 'description' },
  'lat':         { type: 'number', value: 'lat' },
  'lng':         { type: 'number', value: 'lng' },
  'address':     { type: 'string', value: 'address' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  co(function* () {
    try {
      let docs = yield Parking
        .find(query.filter, '-__v -_id')
        .limit(req.query.limit)
        .skip(req.query.skip)
        .sort(req.query.sort)
        .exec()
      res.json(docs)
    } catch(e) {
      return next(e)
    }
  })
}
