const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// two strategies used here: verify with user token or with local input
// after local startegy parses request, it sends email and password to callback
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    user.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err) };
      if(!isMatch) { return done(null, false) };
      return done(null, user);
    })

  })
})

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret
};

// done is like next, error handling/catch
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  User.findById(payload.sub, function(err, user) {
    // first arg is error second arg is payload sent back
    if (err) { return done(err, false) }

    if (user) {
      done(null, user);
    } else {
      done(err, false);
    }
  });
});

// startegies are part of the passport ecosystem and we use them to 
// auth users in different fashions (in this case, from pass-jwt lib)
passport.use(jwtLogin);
passport.use(localLogin);
// export default passportService(function(passport, jwtLogin){}) 