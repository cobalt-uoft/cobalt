import passport from 'passport'
import User from '../model'

export function get(req, res) {
  if (req.user) {
    res.redirect('/user/dashboard')
  } else {
    res.render('pages/signup', {
      user: req.user,
      errors: undefined,
      name: '',
      email: ''
    })
  }
}

export function post(req, res) {
  User.register(new User({ email: req.body.email }), req.body.password, function(err, user) {
    if (err) {
      return res.render('pages/signup', { user: user })
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/')
    })
  })
}

export default { get, post }
