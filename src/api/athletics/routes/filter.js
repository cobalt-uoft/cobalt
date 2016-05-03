import Athletics from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'
import mapReduce from './filterMapReduce'

const KEYMAP = {
  'date':        { type: 'date',   value: 'date' },
  'title':       { type: 'string', value: 'events.title',       relativeValue: 'title' },
  'campus':      { type: 'string', value: 'events.campus',      relativeValue: 'campus' },
  'location':    { type: 'string', value: 'events.location',    relativeValue: 'location' },
  'building_id': { type: 'string', value: 'events.building_id', relativeValue: 'building_id' },
  'start':       { type: 'time',   value: 'events.start_time',  relativeValue: 'start_time' },
  'end':         { type: 'time',   value: 'events.end_time',    relativeValue: 'end_time' },
  'duration':    { type: 'time',   value: 'events.duration',    relativeValue: 'duration' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)
  
  if (query.mapReduce) {
    co(function* () {
      try {
        let docs = yield Athletics.mapReduce({
          query: query.filter,
          scope: {
            q: query.tokens,
            keyMap: KEYMAP
          },
          limit: req.query.limit,
          map: mapReduce.map,
          reduce: mapReduce.reduce
        })
        for (let i = 0; i < docs.length; i++) {
          docs[i] = docs[i].value
        }
        res.json(docs)
      } catch(e) {
        return next(e)
      }
    })
  } else {
    co(function* () {
      try {
        let docs = yield Athletics
          .find(query.filter, '-__v -_id -events._id')
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
}
