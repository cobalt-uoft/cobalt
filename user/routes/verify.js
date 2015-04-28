import User from '../model'

var get = function(req, res) {
  //They request /user/verify?key=<KEY>
  var key = req.query.key

  //Find out who the key belongs to
  User.findOne({
    'api.key': key
  }, function(err, user) {
    if (err) {
      req.flash('verify-error', 'Verification problem')
      return res.render('pages/verified', {
        errors: req.flash('verify-error')
      })
    }

    if (user) {
      var conditions = {
        email: user.email.address
      }
      var update = {
        'email.verified': true
      }

      //Update the db with email being verified
      User.update(conditions, update, null, function(updateErr,
        updateCount) {
        if (updateErr) {
          return res.render('pages/verified', {
            errors: req.flash('verify-error')
          })
        }
        else {
          return res.render('pages/verified')
        }
      })
    }
  })
}

export default get
