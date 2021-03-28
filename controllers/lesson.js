// https://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/
// https://stackoverflow.com/questions/44962062/accessing-google-calendar-api-from-node-server
// https://medium.com/@vishnuit18/google-calendar-sync-with-nodejs-91a88e1f1f47
// https://zapier.com/engineering/how-to-use-the-google-calendar-api/
// https://stackoverflow.com/questions/44962062/accessing-google-calendar-api-from-node-server

const Booking = require('../models/booking.js');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const AWS = require('aws-sdk');
const Stripe = require('stripe');
const stripeSecret = process.env.STRIPE_SECRET_KEY_TEST;
const stripe = Stripe(stripeSecret);

exports.getAllBookings = async function(req, res, next) {
  Booking.find({"userId":req.body.user}, function(err, result) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(result);
    };
  })
}

exports.cancel = async function(req, res, next) {
  await stripe.refunds.create({
    charge: req.body.chargeId,
  }).then(refund => {
    Booking.findOneAndUpdate(
      { "_id":req.body.bookingId }, 
      { 
        "cancelled":true,
        "refundId": refund.id
      }, function(err, doc) {
        if (err) return res.send(500, {error: err});
        res.sendStatus(204);
      } 
    );
  }).catch(err => {
    if (err) return res.send(500, {error: err});
  })
}

exports.getGoogleCalendar = async function(req, res, next) {
    const accessKey = process.env.AWS_ACCESS_KEY
    const secretKey = process.env.AWS_SECRET

    const s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: secretKey
    });

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

    let events = [];
    let calendar = google.calendar('v3');

  	calendar.events.list({
  	    calendarId: process.env.CALENDAR,
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
      	res.json(events)
    });
}