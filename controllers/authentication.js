require('dotenv').config()
const jwt = require('jwt-simple');
const User = require('../models/user.js');
//const webEnvs = ['beta', 'production']
const secret = process.env.JWT_SECRET

function tokenForUser(user) {
  const now = + new Date();
  // const secret = (webEnvs.includes(process.env.NODE_ENV) ? process.env.JWT_SECRET : config.secret)
  // aud should change when process.env changes
  return jwt.encode(
    { 
      sub: user.id, 
      iat: now,
      exp: now+3600000
    }, 
    secret
  );
}

exports.signin = function(req, res, next) {
  res.send({ 
    token: tokenForUser(req.user), 
    _id: req.user._id,
    isAdmin: req.user.isAdmin
  })
}

exports.signup = async function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConf = req.body.passwordConf

  if (password !== passwordConf) {
    return res.sendStatus(406)
  }

  await User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    // If a user with email does exist, return an error
    if (existingUser) {
      return res.sendStatus(422)
    }
    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
      // isAdmin: config.adminWhitelist.includes(email)
    });

    user.save(function(err) {
      if (err) { return next(err); }
      // Repond to request indicating the user was created
      res.json({ 
        token: tokenForUser(user),
        _id: user._id
      });
    });
  })
}

exports.signout = function(req, res, next) {
  res.sendStatus(204)
}
