const Authentication = require('./controllers/authentication.js');
const LessonControl = require('./controllers/lesson.js');
const ChargeControl = require('./controllers/charge.js');
const VideoControl = require('./controllers/video.js');
const passportService = require('./services/passport.js');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get('/', function(req, res) {
  	res.json({ "prognosis":"bigjoe"})
  })
  
  app.post('/signup', Authentication.signup)
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signout', Authentication.signout)
  app.get('/lessons', requireAuth, LessonControl.getAll)
  app.get('/stripe', requireAuth, ChargeControl.serveToken)

  app.get('/calendar', LessonControl.getGoogleCalendar)
  app.get('/test', LessonControl.getCurrentLesson)

  app.post('/charges', requireAuth, ChargeControl.charge)
  app.post('/video', requireAuth, VideoControl.buildVideo)
  app.post('/video_client', requireAuth, VideoControl.requestVideo)
}