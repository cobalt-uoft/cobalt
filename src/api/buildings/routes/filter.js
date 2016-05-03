import Building from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'

// Mapping of valid filter keys
const KEYMAP = {
  'code':       { type: 'string', value: 'code' },
  'name':       { type: 'string', value: 'name' },
  'short_name': { type: 'string', value: 'short_name' },
  'campus':     { type: 'string', value: 'campus' },
  'street':     { type: 'string', value: 'address.street' },
  'city':       { type: 'string', value: 'address.city' },
  'country':    { type: 'string', value: 'address.country' },
  'postal':     { type: 'string', value: 'address.postal' },
  'lat':        { type: 'number', value: 'lat' },
  'lng':        { type: 'number', value: 'lng' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  co(function* () {
    try {
      let docs = yield Building
        .find(query.filter, '-__v -_id -address._id')
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
