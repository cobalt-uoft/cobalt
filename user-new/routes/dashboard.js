var get = function(req, res) {
  if(req.user) {
    res.render('pages/dashboard', { user: req.user })
  } else {
    res.redirect('/login')
  }
}

module.exports = get
