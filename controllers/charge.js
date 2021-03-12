const mongoose = require('mongoose');
const Booking = require('../models/booking.js')
const User = require('../models/user.js')
const Lesson = require('../models/lesson.js')
const AWS = require('aws-sdk')
// const webEnvs = ['beta', 'production']
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
	const userQuery = { "_id": user };
	const lessonQuery = { "_id": lesson };

	const newBooking = new Booking({
		payment_made: true,
		cancelled: false,
		userId: user,
		lessonId: lesson,
		createdAt: new Date()
	});

	try {
		charge = await stripe.charges.create({
	  		amount: req.body.cost*1000,
	  		currency: 'usd',
	  		source: req.body.token,
	  		description: 'My Test Charge API docs',
		});
	} catch (err) {
		res.send(500, { message: err })
	}

	await newBooking.save(function (err, booking) {
		if (err) return handleError(err);
		var str = Math.random().toString(20).split('.')[1]
		let code = str.slice(-4) + str.slice(0, 4) 
		//let code = Math.random().toString(36).substring().split('.')[1];
		User.findOneAndUpdate(
			userQuery, 
			{ 
				"$push": { 
					"bookings": { 
						"_id": booking._id, 
						"lessonId": lesson,
						"code": code,
						"createdAt": new Date()
					}
				} 
			}, function(err, doc) {
				if (err) return res.send(500, {error: err});
			} 
		);

		const emailParams = {
			Source: 'no-reply@yogastaging.net',
			Destination: {
				ToAddresses: [
					'faiden454@gmail.com'
				]
			},
			Message: {
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: `${code}`
					}
				},
				Subject: {
					Charset: 'UTF-8',
					Data: 'Hello Big Joe'
				}
			}
		};

		new AWS.SES(SESConfig).sendEmail(emailParams).promise().then((res) => {
			console.log(res)
		}).catch(err => {
			console.log('error with ses:', err)
		})

		res.sendStatus(204);
	});
}
