var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

var userSchema = new Schema({
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    name: { type: String, required: true },
    emailVerified: Boolean,
    api: {
      key: String
    }
})

//Password hashing
userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) {
      return next()
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          return next(err)
        }

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
              return next(err)
            }
            user.password = hash
            next()
        })
    })
})

userSchema.methods.verifyPassword = function(password, next) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) {
          return next(err)
        }
        next(null, isMatch)
    })
}

var User = mongoose.model('User', userSchema)

//Validation example
User.schema.path('email').validate(function (value) {
  return /blue|green|white|red|orange|periwinkle/i.test(value);
}, 'Invalid email');

module.exports = User
