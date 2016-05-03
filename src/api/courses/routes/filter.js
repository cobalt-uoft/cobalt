import Course from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'
import mapReduce from './filterMapReduce'

// Mapping of valid filter keys
const KEYMAP = {
  'code':         { type: 'string', value: 'code' },
  'name':         { type: 'string', value: 'name' },
  'description':  { type: 'string', value: 'description' },
  'department':   { type: 'string', value: 'department' },
  'division':     { type: 'string', value: 'division' },
  'prerequisite': { type: 'string', value: 'prerequisites' },
  'exclusion':    { type: 'string', value: 'exclusions' },
  'level':        { type: 'number', value: 'level' },
  'breadth':      { type: 'number', value: 'breadths' },
  'campus':       { type: 'string', value: 'campus' },
  'term':         { type: 'string', value: 'term' },
  'meeting_code': { type: 'string', value: 'meeting_sections.code',           relativeValue: 'code' },
  'instructor':   { type: 'string', value: 'meeting_sections.instructors',    relativeValue: 'instructors' },
  'day':          { type: 'string', value: 'meeting_sections.times.day',      relativeValue: 'day' },
  'start':        { type: 'time',   value: 'meeting_sections.times.start',    relativeValue: 'start' },
  'end':          { type: 'time',   value: 'meeting_sections.times.end',      relativeValue: 'end' },
  'duration':     { type: 'time',   value: 'meeting_sections.times.duration', relativeValue: 'duration' },
  'location':     { type: 'string', value: 'meeting_sections.times.location', relativeValue: 'location' },
  'size':         { type: 'number', value: 'meeting_sections.size',           relativeValue: 'size' },
  'enrolment':    { type: 'number', value: 'meeting_sections.enrolment',      relativeValue: 'enrolment' }
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  if (query.mapReduce) {
    co(function* () {
      try {
        let docs = yield Course.mapReduce({
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
        let docs = yield Course
          .find(query.filter, '-__v -_id -meeting_sections._id -meeting_sections.times._id')
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
