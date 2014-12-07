var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({"so much": "data boyz"});
});

module.exports = router;
