// https://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/
// https://stackoverflow.com/questions/44962062/accessing-google-calendar-api-from-node-server
// https://medium.com/@vishnuit18/google-calendar-sync-with-nodejs-91a88e1f1f47
// https://zapier.com/engineering/how-to-use-the-google-calendar-api/
// https://stackoverflow.com/questions/44962062/accessing-google-calendar-api-from-node-server

const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');
const { google } = require('googleapis')
var key = require("../oauth2creds.json");

exports.getAll = async function(req, res, next) {
	Lesson.find({}, function(err, result) {
	    if (err) {
	      console.log(err);
	    } else {
	      res.json(result);
	    }
	});
}

exports.getGoogleCalendar = async function(req, res, next) {
    let jwtClient = new google.auth.JWT(
       key.client_email,
       null,
       key.private_key,
       ['https://www.googleapis.com/auth/calendar']
    );
    //authenticate request
    jwtClient.authorize(function (err, tokens) {
         if (err) {
           console.log(err);
           return;
         } else {
           console.log("Successfully connected!");
         }
    });

	let events = [];
    let calendar = google.calendar('v3');

	calendar.events.list({
        auth: jwtClient,
	    calendarId: 'faiden454@gmail.com',
	    timeMin: (new Date()).toISOString(),
	    maxResults: 9999,
    	singleEvents: true,
    	orderBy: 'startTime'
	}, (err, resp) => {
    	if (err) return console.log('The API returned an error: ' + err)
    	resp.data.items.forEach(item => {
    		events.push(
    			{ 
    				"id": item.id,
    				"title": item.summary,
    				"start": + new Date(item.start.dateTime), 
    				"end": + new Date(item.end.dateTime)
    			}
    		)
    	})
    	//res.json({ "prognosis":resp.data.items })
    	res.json(events)
    });
}