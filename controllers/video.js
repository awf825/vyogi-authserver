const config = require('../config.js');
const User = require('../models/user.js');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

// AWS.config.update({
// 	awsAccessKeyId: config.accessKeyId,
// 	awsSecretAccessKey: config.secretAccessKey
// })

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
    const rooms = await fetch(url, options)
     .then(res => res.json())
     .catch(err => response.status(500).json({ error: err.message }))

    res.json(rooms);
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

  // PUT THE LINK IN BUCKET HERE, IF GOOD, SEND EXISTING RES, 
  // ELSE THROW ERR

exports.requestVideo = function(req, res, next) {
	
}