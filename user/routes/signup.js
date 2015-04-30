import passport from 'passport'
import User from '../model'
import md5 from 'MD5'

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
    email: req.body.email,
    api: {
      key: md5(req.body.email + Math.random())
    }
  }), req.body.password, (err, user) => {
    console.log(err, user)
    if (err) {
      return res.render('pages/signup', {
        errors: [err.message]
      })
    }

    /* TODO: Log the user in upon signup, redirect to
       dashboard */
    passport.authenticate('local')(req, res, () => {
      res.redirect('/')
    })
  })
}
