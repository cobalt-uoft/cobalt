var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/login', { title: 'Cobalt' });
});

router.post('/', function(req, res) {
  // req.query.email/pass
  res.send('logging in lol jk')
})

module.exports = router;
