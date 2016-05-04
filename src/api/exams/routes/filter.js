import Exams from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'
import mapReduce from './filterMapReduce'

// TODO add filters for sections.exam_section

const KEYMAP = {
  'id':       { type: 'string', value: 'id' },
  'code':     { type: 'string', value: 'course_code' },
  'campus':   { type: 'string', value: 'campus' },
  'period':   { type: 'string', value: 'period' },
  'date':     { type: 'date',   value: 'date' },
  'start':    { type: 'time',   value: 'start_time' },
  'end':      { type: 'time',   value: 'end_time' },
  'duration': { type: 'time',   value: 'duration' },
  'lecture':  { type: 'string', value: 'sections.lecture_code', relativeValue: 'lecture_code' },
  'location': { type: 'string', value: 'sections.location',     relativeValue: 'location' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  if (query.mapReduce) {
    co(function* () {
      try {
        let docs = yield Exams.mapReduce({
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
        let docs = yield Exams
          .find(query.filter, '-__v -_id -sections._id')
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
