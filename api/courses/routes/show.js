var Course = require('../model')

var main = function(req, res) {

  if(!Course.hasOwnProperty(req.params.year)) {
    return res.json({
      "error": {
        "code": 0,
      "message": "Invalid year."
      }
    })
  }

  if (req.params.id) {
    Course[req.params.year].find({
      id: req.params.id
    }, function(err, docs) {
      res.json(docs[0])
    })
  } else {
    res.json({
      "error": {
        "code": 0,
      "message": "Does not exist."
      }
    })
  }
}

module.exports = main
