export function get(req, res) {
  if (req.user) {
    res.render('pages/dashboard', { user: req.user })
  } else {
    res.redirect('/login')
  }
}
