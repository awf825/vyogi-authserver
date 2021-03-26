const User = require('../models/user.js');
const Lesson = require('../models/lesson.js');
const Booking = require('../models/booking.js');
const LessonControl = require('./lesson.js');
const AWS = require('aws-sdk');
const { google } = require('googleapis');
const fs = require('fs');
const accessKey = process.env.AWS_ACCESS_KEY
const secretKey = process.env.AWS_SECRET
const fetch = require('node-fetch');

const s3 = new AWS.S3({
  accessKeyId: accessKey,
  secretAccessKey: secretKey
}) 

let now = + new Date();
var y = new Date().getFullYear();
// JS returns 0 for January
var m = ( new Date().getMonth() + 1 );
var d = new Date().getDate();

var et = new Date();
et.setHours( et.getHours() + 1 )

exports.buildVideo = async function(req, res, next) {
  const calendar = await getCalendarJWT()

  calendar.events.list({
      calendarId: process.env.CALENDAR,
      timeMin: (new Date()).toISOString(),
      timeMax: et.toISOString(),
      maxResults: 9999,
      singleEvents: true,
      orderBy: 'startTime'
  }, async (err, resp) => {
      if (err) { res.send({"message":err}) }
      var lesson = resp.data.items[0];
      // basically saying if I don't have any lessons 'on the radar', bounce this request line 91
      if (lesson !== undefined) {
        // you still need to be an admin to build a lesson, if not gt bounced to line 88
        const authorized = await User.findOne({ "_id": req.body.user}).exec();
        // const authorized = await User.findOne({ "_id": "6024afd3e0f778159f23421a"}).exec();
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

          // get the room and tag the bucket with the lesson id obtained in the call to 
          // google
          const room = await fetch(url, options)
           .then(response => response.json())
           .catch(err => res.status(500).json({ "message": err.message }))

          const bucketParams = {
            Bucket: 'lesson-urls',
            Key: `${y}/${m}/${d}/${lesson.id}`,
            Body: room.url
          };

          s3.putObject(bucketParams, function(err, data) {
            if (err) { res.send({"message":err}) }
            else {
              res.json({
                "room": room,
                "bucket": data
              })
            }
          })
        } else {
          res.send({"message":"You are not authorized to perform this action."});
        }
      } else {
        res.json({"message":"There is no lesson to build at this time."})
      }
  });
}

exports.requestVideo = async function(req, res, next) {
  const calendar = await getCalendarJWT()

  calendar.events.list({
      calendarId: process.env.CALENDAR,
      timeMin: (new Date()).toISOString(),
      timeMax: et.toISOString(),
      maxResults: 9999,
      singleEvents: true,
      orderBy: 'startTime'
  }, async (err, resp) => {
      if (err) { res.send({"message":err}) }
      var lesson = resp.data.items[0]
      if (lesson !== undefined) {
        var codesByLessonBookings = await Booking.find({"lessonId":lesson.id})
        const codes = codesByLessonBookings.map(bkg=>bkg.code)

        if (codes.includes(req.body.code)) {
          const bucketParams = {
            Bucket: 'lesson-urls',
            Key: `${y}/${m}/${d}/${lesson.id}`
          }

          const bucketResponse = await s3.getObject(bucketParams, function(err, data) {
            if (err) { return res.send({"message":err}) }
            res.json(data.Body.toString('utf-8'))
          });
          
        } else {
          return res.json({"message":"code is invalid"})
        }
      } else {
        res.json({"message":"There is no lesson to request at this time."})
      }
  })
}

getCalendarJWT = async function(req, res, next) {
  try {
      const params = {
          Bucket: process.env.GOOGLE_CREDS_BUCKET_NAME,
          Key: process.env.GOOGLE_CREDS_BUCKET_KEY
      };
      // RIGHT HERE
      var resp = await s3.getObject(params).promise();

  } catch (error) {
      console.log(error);
      return;
  }  

  const creds = JSON.parse(resp.Body.toString('utf-8'));

  const key = {
    client_email: creds.client_email,
    private_key: creds.private_key,
  }

  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/calendar"],
    null
  );

  google.options({auth});

  let calendar = google.calendar('v3');

  return calendar;

}