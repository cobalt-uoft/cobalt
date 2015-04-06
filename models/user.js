var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    email: String,
    password: String,
    salt: String,
    first_name: String,
    last_name: String,
    emailVerified: Boolean,
    api: {
      key: String,
      calls: [String]
    }
})

/* TODO: Attach passport auth stuff from app.js to this model. */

module.exports = mongoose.model('User', User);
