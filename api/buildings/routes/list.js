import Building from '../model'
import co from 'co'

export default function get(req, res) {

  var limit = 10
  var skip = 0

  var qLimit = limit
  if(req.query.limit) {

    if(req.query.limit <= 100) {
      qLimit = req.query.limit
    } else {
      res.json({
        "error": {
          "code": 0,
        "message": "Limit must be less than or equal to 100."
        }
      })
      return
    }

  }

  var qSkip = skip
  if(req.query.skip) {
    qSkip = req.query.skip
  }

  var filter = {}

  if(req.query.campus) {
    let campus = req.query.campus.toUpperCase()
    if(["UTSG", "UTSC", "UTM"].indexOf(campus) > -1) {
      filter["campus"] = campus
    }
  }
 
  co(function* () {
    var docs = yield Building.find(filter).skip(qSkip).limit(qLimit).exec()
    res.json(docs)
  }).catch((err) => {
    res.json(err)
  })
  
}