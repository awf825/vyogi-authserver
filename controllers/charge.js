//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html
const mongoose = require('mongoose');
const Booking = require('../models/booking.js')
const User = require('../models/user.js')
const Lesson = require('../models/lesson.js')
const AWS = require('aws-sdk')
const pubKey = process.env.STRIPE_PUBLISHABLE_KEY_TEST;
const stripeSecret = process.env.STRIPE_SECRET_KEY_TEST;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET;

const SESConfig = {
	apiVersion: '2010-12-01',
	accessKeyId: accessKey,
	secretAccessKey: secretKey,
	region: 'us-east-1'
}

exports.serveToken = function(req, res, next) {
	res.json(pubKey)
}

exports.charge = async function(req, res, next) {
	const Stripe = require('stripe');
	const stripe = Stripe(stripeSecret);
	const lesson = req.body.lesson;
	const user = req.body.user;
	const email = req.body.email;
	const userQuery = { "_id": user };
	var str = Math.random().toString(20).split('.')[1];
	let code = str.slice(-4) + str.slice(0, 4);

	stripe.charges.create({
	 	amount: req.body.cost*1000,
	 	currency: 'usd',
	  	source: req.body.token,
	  	description: 'My Test Charge API docs',
	}).then(async charge => {

		const newBooking = new Booking({
			payment_made: true,
			cancelled: false,
			userId: user,
			lessonStart: req.body.start,
			lessonEnd: req.body.end,
			lessonCost: req.body.cost,
			chargeId: charge.id,
			code: code,
			createdAt: new Date()
		});

		await newBooking.save(function (err, booking) {
			if (err) return handleError(err);
			User.findOneAndUpdate(
				userQuery, 
				{ 
					"$push": { 
						"bookings": { 
							"_id": booking._id, 
							"lessonId": lesson,
							"code": booking.code,
							"lessonStart": booking.lessonStart,
							"lessonEnd": booking.lessonEnd,
							"lessonCost": booking.lessonCost,
							"chargeId": charge.id,
							"createdAt": new Date()
						}
					} 
				}, function(err, doc) {
					if (err) return res.send(500, {error: err});
				} 
			);

			const emailParams = {
				Source: process.env.SES_OUTBOUND,
				Destination: {
					ToAddresses: [`${email}`]
				},
				Message: {
					Body: {
						Html: {
							Charset: 'UTF-8',
							Data: 
							`
								Hello ${email.split('@')[0]},
								<br>
								<br>
								Thank you for signing up for a private yoga lesson! I can't wait to see you! I'm hoping our time together leaves you feeling calm and refreshed. 
								Use the code below to access the video when its time for our lesson.
								<br>
								<strong>${code}</strong>
								<br>
								See you there!
								<br>
								<br>
								Lan
							`
						}
					},
					Subject: { Charset: 'UTF-8', Data: 'Access Code' }
				}
			};

			new AWS.SES(SESConfig).sendEmail(emailParams).promise().then((res) => {
				console.log(res)
			}).catch(err => {
				console.log('error with ses:', err)
			})

			res.sendStatus(204);
		});
	}).catch(err => {
		res.send(500, { message: err })
	})
}
