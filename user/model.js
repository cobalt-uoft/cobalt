var mongoose = require('mongoose')
var Schema = mongoose.Schema
var md5 = require('MD5')

var userSchema = new Schema({
  email: {
    address: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    },
    verified: Boolean
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  salt: {
    type: String
  },
  api: {
    key: String,
    calls: [String]
  },
  lastsesh: String
})

userSchema.methods.getCount = function(call) {
  let count = 0
  for (let i = 0; i < this.api.calls.length; i++) {
    if (call === this.api.calls[i]) {
      count++
    }
  }
  return count
}

userSchema.methods.getLastCall = function(){
  return this.api.calls[this.api.calls.length - 1]
}

userSchema.methods.generateKeys = function() {
  this.api.key = md5(this.email + this.salt)
  console.log(this.api.key)
}

userSchema.statics.login = function(email, password, next) {
  this.findOne({
    'email.address': email
  }, function(err, user) {
    if (err) {
      return next({
        message: 'Mongo error'
      })
    }
    if (user === undefined) {
      return next({
        message: 'User does not exist'
      })
    }

    var isMatch = (md5(user.name + email + password + user.salt) === user.password)

    if (isMatch) {
      return next(null, user)
    } else {
      return next({
        message: 'Incorrect password'
      })
    }
  })
}

module.exports = mongoose.model('User', userSchema)
