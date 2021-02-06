const config = require('../config.js');
const User = require('../models/user.js');
const Lesson = require('../models/lesson.js');
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY || config.accessKeyId,
  secretAccessKey: process.env.AWS_SECRET || config.secretAccessKey
}) 

let now = + new Date();
var y = new Date().getFullYear();
// JS returns 0 for Jan
var m = ( new Date().getMonth() + 1 );
var d = new Date().getDate();

exports.buildVideo = async function(req, res, next) {
  const authorized = await User.findOne({ "_id": req.body.user}).exec();
  if (authorized && authorized.isAdmin) {
    let url = process.env.DAILY_URL || config.dailyUrl;
    let videoToken = process.env.DAILY_API_KEY || config.dailyVideoApiKey
    
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
     // .catch(err => response.status(500).json({ error: err.message }))

    let currentLessonId = await Lesson.find( { startTime: { $lt: now } }, {'_id': 1} ).sort( { $natural: -1 } ).limit(1);

    const bucketParams = {
      Bucket: 'lesson-urls',
      Key: `${y}/${m}/${d}/${currentLessonId}`,
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
    res.sendStatus(406);
  }
}

exports.requestVideo = async function(req, res, next) {
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
