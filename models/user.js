var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    email: String,
    password: String,
    name: String,
    emailVerified: Boolean,
    apiKey: String
});

User.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

module.exports = mongoose.model('User', User);
