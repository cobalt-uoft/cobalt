var passport = require('passport')

var get = function(req, res) {
  req.logout()
  res.redirect('/')
}

module.exports = get