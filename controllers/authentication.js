const jwt = require('jwt-simple');
const User = require('../models/user.js');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  // attach token logic here to whitelisted emails stored in config (me, Alanna, others)
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  res.send({ 
    token: tokenForUser(req.user), 
    _id: req.user._id
  })
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConf = req.body.passwordConf

  if (password !== passwordConf) {
    return res.sendStatus(406)
  }
  // See if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    // If a user with email does exist, return an error
    if (existingUser) {
      return res.sendStatus(422)
    }
    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) { return next(err); }
      // Repond to request indicating the user was created
      res.json({ 
        token: tokenForUser(user),
        _id: user._id
      });
    });
  });
}

exports.signout = function(req, res, next) {
  res.sendStatus(204)
}
