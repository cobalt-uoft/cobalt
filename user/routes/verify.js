import User from '../model'
import co from 'co'

export default function get(req, res) {
  //They request /user/verify?key=<KEY>
  var key = req.query.key

  //Find out who the key belongs to
  co(function* () {
    var user = yield User.findOne({ 'api.key': key }).exec()

    if (user) {
      /* TODO: Make this utilize promises? */
      //Update the db with email being verified
      User.update({
        email: user.email.address
      }, {
        'email.verified': true
      }, null, (err, updateCount) => {
        if (err) {
          return res.render('pages/verified', {
            errors: req.flash('verify-error')
          })
        }
        return res.render('pages/verified')
      })
    }
  }).catch(err => {
    req.flash('verify-error', 'Verification problem')
    return res.render('pages/verified', {
      errors: req.flash('verify-error')
    })
  })
}
