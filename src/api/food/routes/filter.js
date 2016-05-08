import Food from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'

// Mapping of valid filter keys
const KEYMAP = {
  'name':       { type: 'string', value: 'name' },
  'short_name': { type: 'string', value: 'short_name' },
  'campus':     { type: 'string', value: 'campus' },
  'address':    { type: 'string', value: 'address' },
  'lat':        { type: 'number', value: 'lat' },
  'lng':        { type: 'number', value: 'lng' },
  'tag':        { type: 'string', value: 'tags' },
  'open':       { type: 'day', value: null }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  co(function* () {
    try {
      let docs = yield Food
        .find(query.filter, '-__v -_id -hours._id')
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
