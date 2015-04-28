var passport = require('passport')

var get = function(req, res) {
  if(req.user) {
    res.redirect('/user/dashboard')
  } else {
    var errors = req.flash('error')
    res.render('pages/login', {
      user: req.user,
      errors: errors
    })
  }
}

var post = passport.authenticate('local', {
  successRedirect: '/user/dashboard',
  failureRedirect: '/user/login',
  failureFlash: true
})

module.exports = {
  get: get,
  post: post
}