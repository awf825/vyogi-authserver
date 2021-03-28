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
var nodemailer = require('nodemailer');

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
					let subject = "BigJoe";
					let transporter = nodemailer.createTransport({
						host: 'smtp.gmail.com',
						port: 465,
						secure: true,
						//!!! 
						// https://medium.com/@mavroeidakos.theodoros/configuring-nodemailer-with-gmail-in-aws-ec2-dc16b27b49ad
						// auth: {
						// 	type: "OAuth2",
						// 	user:
						// 	clientId: 
						// 	clientSecret:
						// 	refreshToken:
						// }
						auth: {     
			        		user: process.env.CODE_GMAIL_ADDRESS,     
			        		pass: process.env.CODE_GMAIL_PASS   
			      		}
					})

					let mailOptions = {
						to: `${email}`,
						from: process.env.CODE_GMAIL_PASS,
						subject: "Thank you for ordering an online yoga lesson!",
						text: "Hello Big Joe"
					};

					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							res.send(500, { message: error })
					        res.end();
				      	}
					    res.sendStatus(204); 
					    res.end()
					})
				} 
			);
		});
	}).catch(err => {
		res.send(500, { message: err })
	})
}
