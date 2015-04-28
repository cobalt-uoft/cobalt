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

  if(req.query.q) {

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

    if(req.query.q.length >= 3) {
      Course[req.params.year].find({
        "code": { $regex: "^.*" + escapeRe(req.query.q).toUpperCase() + ".*"}
      }).skip(qSkip).limit(qLimit).exec(function(err, docs) {
        if(docs.length == 0) {
          Course[req.params.year].find({
              $text: { $search: req.query.q }
            }).skip(qSkip).limit(qLimit).exec(function(err, docs) {
              res.json(docs)
          })
        } else {
          res.json(docs)
        }
      })
    } else {
      res.json({
        "error": {
          "code": 0,
        "message": "Query must be of at least length 3."
        }
      })
    }

  } else {
    res.json({
      "error": {
        "code": 0,
      "message": "Query must be specified."
      }
    })
  }

}

function escapeRe(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = main
