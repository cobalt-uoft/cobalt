var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res) {
  if(req.user) {
    res.redirect('/dashboard')
  } else {
    res.render('pages/signup', { user: req.user })
  }
})

router.post('/', function(req, res) {

  /* TODO: Ivan's register method gets called here */

  var err = true

  if (err) {
    console.log(err)
    return res.render('pages/signup', { user : req.user })
  }

  passport.authenticate('local')(req, res, function () {
    console.log('mhhmmm')
    res.redirect('/dashboard')
  })

})

module.exports = router;
