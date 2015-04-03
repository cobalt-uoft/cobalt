var express = require('express');
var passport = require('passport');
var User = require('../models/user')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  console.log('Dashboard!')
  console.log(req.profile)
  console.log(res.user)
  if(req.user) {
    res.render('pages/dashboard', { user: req.user });
  } else {
    res.redirect('/login')
  }

});

module.exports = router;
