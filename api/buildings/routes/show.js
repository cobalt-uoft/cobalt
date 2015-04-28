var Building = require('../model')

var main = function(req, res) {

  if (req.params.id) {
    Building.find({
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
