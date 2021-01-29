const Authentication = require('./controllers/authentication.js');
const LessonControl = require('./controllers/lesson.js')
const passportService = require('./services/passport.js');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get("/", function(req, res) {
    res.send({ message: 'SUPER SECRET CODE IS' })
  })
  app.post('/signup', Authentication.signup)
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signout', Authentication.signout)
  app.get('/lessons', requireAuth, LessonControl.getAll)
  //app.get('/blah', requireAuth, Foo.bar)
}