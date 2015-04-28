import passport from 'passport'

export function get(req, res) {
  if (req.user) {
    res.redirect('/user/dashboard')
  } else {
    let errors = req.flash('error')
    res.render('pages/login', {
      user: req.user,
      errors: errors
    })
  }
}

export let post = passport.authenticate('local', {
  successRedirect: '/user/dashboard',
  failureRedirect: '/user/login',
  failureFlash: true
})
