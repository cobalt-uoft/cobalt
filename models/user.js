var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  name: { type: String, required: true },
  emailVerified: Boolean,
  api: {
    key: String
  }
})

userSchema.methods.signup = function(next) {
  //the "this" object is the User instance
  //attempt to register, aka validation
  return next(null) //return next(err object) if error
}

userSchema.methods.verifyPassword = function(password, next) {
  //the "this" object is the User instance
  //Callback "next" is function(err, doc)
}

module.exports = mongoose.model('User', userSchema)
