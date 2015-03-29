var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/signup', { title: 'Cobalt' });
});

router.post('/', function(req, res) {
  // req.query.name/email/pass
  res.send("signing up lol jk")
})

module.exports = router;
