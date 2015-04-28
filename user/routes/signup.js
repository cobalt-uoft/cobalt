import User from '../model'
import md5 from 'MD5'

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
  var email = req.body.email.toLowerCase()
  var password = req.body.password
  var name = req.body.name

  var isError = false

  var checkEmail = email.search(
    new RegExp(
      '[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+' +
      '(?:\\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@' +
      '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+' +
      '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'
    )
  )
  if (checkEmail === -1) {
    req.flash('signup-error', 'Bad email')
    isError = true
  }

  var checkPassword = password.search(
    /^((?=.*\d)(?=.*[a-z@#$%]).{6,64})$/
  )
  if (checkPassword === -1) {
    req.flash('signup-error', 'Bad password')
    isError = true
  }

  var checkName = name.search(
    /^([ \u00c0-\u01ffa-zA-Z'\-])+$/
  )
  if (checkName === -1) {
    req.flash('signup-error', 'Bad name')
    isError = true
  }

  if (isError) {
    return res.render('pages/signup', {
      user: req.user,
      errors: req.flash('signup-error'),
      name: name,
      email: email
    })
  }

  /* No input issues thus far: attempt to sign up. */

  User.findOne({
    'email.address': email
  }, function(err, user) {
    if (err) {
      req.flash('signup-error', 'Mongo problem')
      return res.render('pages/signup', {
        user: req.user,
        errors: req.flash('signup-error'),
        name: name,
        email: email
      })
    }

    //user is found
    if (user) {
      req.flash('signup-error', 'Email Already Exists')
      return res.render('pages/signup', {
        user: req.user,
        errors: req.flash('signup-error'),
        name: name,
        email: email
      })
    } else {
      //no user with that email
      //create user
      var newUser = new User()
      newUser.email.address = email
      newUser.salt = md5(name + email + process.env.SALTY)
      newUser.password = md5(name + email + password + newUser.salt)
      newUser.name = name
      newUser.generateKeys()
      newUser.save(function(saveErr) {
        if (saveErr) {
          /* TODO: not necessarily just 'bad email' */
          req.flash('signup-error', 'Bad email')
          res.render('pages/signup', {
            user: req.user,
            errors: req.flash('signup-error'),
            name: name,
            email: email
          })
        } else {
          newUser.save() // success
          req.login(newUser, function(loginErr) {
            if (loginErr) {
              req.flash('signup-error', 'Passport error')
              res.render('pages/signup', {
                user: req.user,
                errors: req.flash('signup-error'),
                name: name,
                email: email
              })
            }
            return res.redirect('/user/dashboard')
          })
        }
      })
    }
  })
}

export default { get, post }
