const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  // email: { type: String, unique: true, lowercase: true },
  // password: String,
  //   name: {
  //   type: String,
  //   required: true,
  //   minlength: 5,
  //   maxlength: 50
  // },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: Boolean,
  bookings: Array
},
  { collection: "user" }
)

// same as before_save callback in rails (presave)
userSchema.pre('save', function(next) {
  // 'this' = @user in js
  const user = this

  // callback on making salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }

    // callback on applying salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }

      user.password = hash;
      next();
    })
  })
})

// / methods object basically says that whenever we create a 
// user object its gonna have access to any methods defined 
// on this obj (like a scope method in rails or appending to js obj)
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err) };
    callback(null, isMatch);
  })
}

module.exports = mongoose.model('user', userSchema)