const Authentication = require('./controllers/authentication.js');
const LessonControl = require('./controllers/lesson.js');
const ChargeControl = require('./controllers/charge.js');
const VideoControl = require('./controllers/video.js');
const passportService = require('./services/passport.js');
const passport = require('passport');

var nodemailer = require('nodemailer');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get('/', function(req, res) {
  	res.json({ "prognosis":"bigjoe"})
  })
  
  app.post('/signup', Authentication.signup)
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signout', Authentication.signout)
  app.post('/bookings', requireAuth, LessonControl.getAllUserBookings)
  app.get('/lessonBookings', requireAuth, LessonControl.getAllLessonBookings)
  app.post('/cancel', requireAuth, LessonControl.cancel)
  app.get('/stripe', requireAuth, ChargeControl.serveToken)
  app.get('/calendar', requireAuth, LessonControl.getGoogleCalendar)
  app.post('/charges', requireAuth, ChargeControl.charge)
  app.post('/video', requireAuth, VideoControl.buildVideo)
  app.post('/video_client', requireAuth, VideoControl.requestVideo)
}