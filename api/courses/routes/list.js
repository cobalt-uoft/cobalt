var Course = require('../model')

var limit = 10
var skip = 0

var main = function(req, res) {

  if(!Course.hasOwnProperty(req.params.year)) {
    return res.json({
      "error": {
        "code": 0,
      "message": "Invalid year."
      }
    })
  }

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
    campus = req.query.campus.toUpperCase()
    if(["UTSG", "UTSC", "UTM"].indexOf(campus) > -1) {
      filter["campus"] = campus
    }
  }

  Course[req.params.year].find(filter).skip(qSkip).limit(qLimit).exec(function(err, docs) {
    if(err) {
      res.json(err)
    }
    res.json(docs)
  })
}

module.exports = main
