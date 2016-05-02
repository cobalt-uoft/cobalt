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

  // Split query into tokens
  let q = QueryParser.tokenize(req.query.q)

  // Start Mongo-DB compatible filter
  let filter = { $and: [] }

  // Parse each token
  for (let i = 0; i < q.length; i++) {
    filter.$and[i] = { $or: [] }
    for (let j = 0; j < q[i].length; j++) {
      q[i][j] = QueryParser.parse(q[i][j])
      // Verify that the key is valid
      if (!KEYMAP.hasOwnProperty(q[i][j].key)) {
        let err = new Error(`Filter key '${q[i][j].key}' is not supported.`)
        err.status = 400
        return next(err)
      }
      // Form Mongo-DB compatible filter from key type
      filter.$and[i].$or[j] = {}
      filter.$and[i].$or[j][KEYMAP[q[i][j].key].value] = KEYMAP[q[i][j].key].type(q[i][j].filter)
    }
  }

  co(function* () {
    try {
      let docs = yield Building
        .find(filter, '-__v -_id -address._id')
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
