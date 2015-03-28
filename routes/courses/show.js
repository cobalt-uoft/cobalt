var express = require('express')
var Courses = require('../../schemas/courses')
var router = express.Router()

router.get('/:id', function(req, res) {

  if (req.params.id) {
    Courses.find({
      course_id: req.params.id
    }, function(err, docs) {
      res.json(docs[0])
    })
  } else {
    res.status(403).end()
    return
  }
})

module.exports = router
