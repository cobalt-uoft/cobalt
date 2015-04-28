import passport from 'passport'
import User from '../model'

export function get(req, res) {
  if (req.user) {
    res.redirect('/user/dashboard')
  } else {
    res.render('pages/signup')
  }
}

export function post(req, res) {
  User.register(new User({
    name: req.body.name,
    email: req.body.email
  }), req.body.password, (err, user) => {
    console.log(err, user)
    if (err) {
      return res.render('pages/signup', {
        errors: [err.message]
      })
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/')
    })
  })
}
