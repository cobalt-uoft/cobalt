import Textbook from '../model'
import co from 'co'
import QueryParser from '../../utils/query-parser'

const KEYMAP = {
  'isbn':               { type: 'string', value: 'isbn' },
  'title':              { type: 'string', value: 'title' },
  'edition':            { type: 'number', value: 'edition' },
  'author':             { type: 'string', value: 'author' },
  'image':              { type: 'string', value: 'image' },
  'price':              { type: 'number', value: 'price' },
  'url':                { type: 'string', value: 'url' },
  'course_id':          { type: 'string', value: 'courses.id' },
  'course_code':        { type: 'string', value: 'courses.code' },
  'course_requirement': { type: 'string', value: 'courses.requirement' },
  'meeting_code':       { type: 'string', value: 'courses.meeting_sections.code' },
  'instructor':         { type: 'string', value: 'courses.meeting_sections.instructors' },
}

export default function filter(req, res, next) {
  // Generate parsed tokens and filters from query
  let query = QueryParser.parseQuery(req.query.q, KEYMAP)

  co(function* () {
    try {
      let docs = yield Textbook
        .find(query.filter, '-__v -_id -courses._id -courses.meeting_sections._id')
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
