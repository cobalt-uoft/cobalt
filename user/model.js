import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'
import md5 from 'MD5'

let User = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  verified: {
    type: Boolean
  },
  name: {
    type: String,
    required: true
  },
  api: {
    key: String,
    calls: [String]
  }
})

User.plugin(passportLocalMongoose, {
  // Use 'email' as username field
  usernameField: 'email',

  // Convert emails to lowercase
  usernameLowerCase: true
})

User.methods.getLastCall = function(){
  return this.api.calls[this.api.calls.length - 1]
}

User.methods.generateKeys = function() {
  this.api.key = md5(this.email + this.salt)
  console.log(this.api.key)
}

User.statics.apiAuth = function (req, res, next) {

}

export default mongoose.model('User', User)
