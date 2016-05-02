import Building from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'

// Mapping of valid filter keys
const KEYMAP = {
  'code':       { type: QueryParser.String, value: 'code' },
  'name':       { type: QueryParser.String, value: 'name' },
  'short_name': { type: QueryParser.String, value: 'short_name' },
  'campus':     { type: QueryParser.String, value: 'campus' },
  'street':     { type: QueryParser.String, value: 'address.street' },
  'city':       { type: QueryParser.String, value: 'address.city' },
  'country':    { type: QueryParser.String, value: 'address.country' },
  'postal':     { type: QueryParser.String, value: 'address.postal' },
  'lat':        { type: QueryParser.Number, value: 'lat' },
  'lng':        { type: QueryParser.Number, value: 'lng' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)
  if (query.error) return next(query.error)

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
