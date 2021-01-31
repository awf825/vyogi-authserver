const config = require('../config.js');
const User = require('../models/user.js');
const Lesson = require('../models/lesson.js');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
}) 

exports.buildVideo = async function(req, res, next) {
  const authorized = await User.findOne({ "_id": req.body.user}).exec();
  if (authorized && authorized.isAdmin) {
    let now = + new Date();
    let url = 'https://api.daily.co/v1/rooms';
    
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${config.dailyVideoApiKey}`
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

    let currentLessonId = await Lesson.find( { startTime: { $lt: now } }, {'_id': 1} ).sort( { $natural: -1 } ).limit(1);
    var y = new Date().getFullYear();
    // JS returns 0 for Jan
    var m = ( new Date().getMonth() + 1 );
    var d = new Date().getDate();

    const bucketParams = {
      Bucket: config.resourceBucket,
      Key: `${y}/${m}/${d}/${currentLessonId}`,
      Body: room.url
    };

    s3.putObject(bucketParams, function(err, data) {
      if (err) { return res.send({"message":err}) }
    });

    res.json(room);
  } else {
    res.sendStatus(406);
  }
}

   // {
   // 	"id":"94eb015f-8814-4ee2-85f4-cce949add0df",
   // 	"name":"9Fx791084ixqZrFRS8lM",
   // 	"api_created":true,
   // 	"privacy":"public",
   // 	"url":"https://flynn.daily.co/9Fx791084ixqZrFRS8lM",
   // 	"created_at":"2021-01-31T06:11:34.403Z",
   // 	"config":{
   // 		"nbf":null,
   // 		"exp":1612077094031,
   // 		"max_participants":1,
   // 		"enable_screenshare":true,
   // 		"enable_chat":null,
   // 		"enable_knocking":null,
   // 		"start_video_off":false,
   // 		"start_audio_off":false,
   // 		"owner_only_broadcast":false,
   // 		"audio_only":false,
   // 		"enable_recording":null,
   // 		"enable_dialin":null,
   // 		"autojoin":null,
   // 		"meeting_join_hook":null,
   // 		"eject_at_room_exp":null,
   // 		"eject_after_elapsed":null,
   // 		"lang":null,
   // 		"sfu_switchover":4,
   // 		"switchover_impl":null,
   // 		"signaling_impl":null,
   // 		"geo":null
   // 	}
   // }

exports.requestVideo = function(req, res, next) {
	
}