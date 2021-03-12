const User = require('../models/user.js');
const Lesson = require('../models/lesson.js');
const LessonControl = require('./lesson.js');
const AWS = require('aws-sdk');
const fs = require('fs');
const accessKey = process.env.AWS_ACCESS_KEY
const secretKey = process.env.AWS_SECRET
const fetch = require('node-fetch');

const s3 = new AWS.S3({
  accessKeyId: accessKey,
  secretAccessKey: secretKey
}) 

const { google } = require('googleapis')
const { OAuth2 } = google.auth
const OAuth2ClientId = process.env.GOOGLE_OAUTH2_CLIENT_ID;
const OAuth2Secret = process.env.GOOGLE_OAUTH2_CLIENT_SECRET;
const OAuth2RefreshToken = process.env.GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN;
const OAuth2Client = new OAuth2(OAuth2ClientId, OAuth2Secret);
OAuth2Client.setCredentials({ refresh_token: OAuth2RefreshToken })
const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })

let now = + new Date();
var y = new Date().getFullYear();
// JS returns 0 for January
var m = ( new Date().getMonth() + 1 );
var d = new Date().getDate();

exports.buildVideo = async function(req, res, next) {
  const authorized = await User.findOne({ "_id": req.body.user}).exec();
  if (authorized.isAdmin) {
    let url = process.env.DAILY_URL
    let videoToken = process.env.DAILY_API_KEY
    
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${videoToken}`
      },
      body: JSON.stringify({
        properties: { 
          exp: now+3600000
        }
      })
    };

    const room = await fetch(url, options)
     .then(res => res.json())
     .catch(err => response.status(500).json({ error: err.message }))

    //let currentLessonId = await Lesson.find( { startTime: { $lt: now } }, {'_id': 1} ).sort( { $natural: -1 } ).limit(1);
    const currentLesson = calendar
    if (currentLesson) {
      res.json({"currentLesson":currentLesson})
    }

    // const bucketParams = {
    //   Bucket: 'lesson-urls',
    //   Key: `${y}/${m}/${d}/${currentLesson.id}`,
    //   Body: room.url
    // };

    // s3.putObject(bucketParams, function(err, data) {
    //   if (err) { res.send({"message":err, "big":"joe"}) }
    //   else {
    //     res.json({
    //       "room": room,
    //       "bucket": data
    //     })
    //   }
    // })
  } else {
    res.send({"message":"You are not authorized to perform this action."});
  }
}

exports.requestVideo = async function(req, res, next) {
  // if we're opting for the google calendar, this logic can be done away with
  // can link bookings and users by lesson id attached to google events
  // LessonControl.getCurrentLesson or something like that
  let currentLessonId = await Lesson.find( { startTime: { $lt: now } }, {'_id': 1} ).sort( { $natural: -1 } ).limit(1);
  let currentLesson = await Lesson.find( { startTime: { $lt: now } } ).sort( { $natural: -1 } ).limit(1);
  if (typeof(currentLesson) !== undefined) {
    const codes = currentLesson[0].bookings.map(bkg=>bkg.code)
    if (codes.includes(req.body.code)) {
      const bucketParams = {
        Bucket: 'lesson-urls',
        Key: `${y}/${m}/${d}/${currentLessonId}`
      }
      const bucketResponse = await s3.getObject(bucketParams, function(err, data) {
        if (err) { return res.send({"message":err}) }
        res.json(data.Body.toString('utf-8'))
      });
    } else {
      return res.json({"message":"code is invalid"})
    }
  } else {
    return res.json({"message":"lesson is undefined"})
  }
}
