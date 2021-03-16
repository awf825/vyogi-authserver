const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');
const { google } = require('googleapis')
// https://medium.com/@vishnuit18/google-calendar-sync-with-nodejs-91a88e1f1f47
// https://zapier.com/engineering/how-to-use-the-google-calendar-api/

let auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH2_CLIENT_ID,
    process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH2_REDIRECT
);

let credentials = {
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
};
auth.setCredentials(credentials);

const calendar = google.calendar({ version: 'v3', auth: auth })

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