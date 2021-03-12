const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const OAuth2ClientId = process.env.GOOGLE_OAUTH2_CLIENT_ID;
const OAuth2Secret = process.env.GOOGLE_OAUTH2_CLIENT_SECRET;
const OAuth2RefreshToken = process.env.GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN;
// should hoist google vars here and make this control pump calendar data 
// to local methods
const OAuth2Client = new OAuth2(OAuth2ClientId, OAuth2Secret);
OAuth2Client.setCredentials({ refresh_token: OAuth2RefreshToken })
const calendar = google.calendar({ version: 'v3', auth: OAuth2Client })
// https://zapier.com/engineering/how-to-use-the-google-calendar-api/

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
	let events = [];

	calendar.events.list({
	    calendarId: 'primary',
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

// change this to local export
exports.getCurrentLesson = async function() {
	//return "bigjoe";
	var et = new Date();
	et.setHours( et.getHours() + 2 )

	// let lesson;

	await calendar.events.list({
	    calendarId: 'primary',
	    timeMin: (new Date()).toISOString(),
	    timeMax: et.toISOString(),
	    maxResults: 9999,
    	singleEvents: true,
    	orderBy: 'startTime'
	}, (err, resp) => {
    	if (err) return err
    	//return resp.data.items[0];
    	return err;
    });

    // return lesson;
}