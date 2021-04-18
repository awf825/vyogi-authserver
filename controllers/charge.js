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
var xoauth2 = require('xoauth2')

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
	}).then(charge => {

		const newBooking = new Booking({
			payment_made: true,
			cancelled: false,
			userId: user,
			lessonId: lesson,
			lessonStart: req.body.start,
			lessonEnd: req.body.end,
			lessonCost: req.body.cost,
			chargeId: charge.id,
			userName: req.body.userName,
			pregnancyCheck: req.body.check,
			practiced: req.body.practiced,
			limitations: req.body.limitations,
			focus: req.body.focus,
			needToKnow: req.body.needToKnow,
			code: code,
			createdAt: new Date()
		});

		newBooking.save(async function (err, booking) {
			if (err) return handleError(err);
			let clientHtml = `
				<div>
					<p>Hello ${email.split('@')[0]},</p>
					<br>
					<p>
						Thank you for signing up for a private yoga lesson! I can't wait to see you! 
						I'm hoping our time together leaves you feeling calm and refreshed. 
						Use the code below to access the video when its time for our lesson.
					</p>
					<br>
					<p>
						<strong>${code}</strong>
					</p>
					<br>
					<p>See you there!</p>
					<br>
					<p>Lan</p>
				</div>
			`

			let instructorHtml = `
				<div>
					<h3>${booking.userName}</h3>
				 	<h3>Pregnant? ${booking.pregnancyCheck}</h3>
				 	<h3>Experience</h3>
				 	<p>${booking.practiced}</p>
				 	<h3>Limitations</h3>
				 	<p>${booking.limitations}</p>
				 	<h3>Focus</h3>
				 	<p>${booking.focus}</p>
				 	<h3>Need to Know?</h3>
				 	<p>${booking.needToKnow}</p>
				</div>
			`

			var mailTokenGen = xoauth2.createXOAuth2Generator({
				type: "OAuth2",
				user: process.env.CODE_GMAIL_ADDRESS,
				pass: process.env.CODE_GMAIL_PASS,
				clientId: process.env.GMAIL_OAUTH2_ID,
				clientSecret: process.env.GMAIL_OAUTH2_SECRET,
				refreshToken: process.env.GMAIL_OAUTH2_REFRESH_TOKEN
			})

			var smtpTransport = nodemailer.createTransport({
			    host: 'smtp.gmail.com',
    			port: 465,
    			secure: true,
			    auth: {
			    	user: process.env.CODE_GMAIL_ADDRESS,
					pass: process.env.CODE_GMAIL_PASS,
			        xoauth2: mailTokenGen
			    }
			});

			let mailOptions = [
				{
					to: process.env.CALENDAR,
					from: process.env.CODE_GMAIL_ADDRESS,
					subject: `${booking.userName}`,
					html: instructorHtml
				},
				{
					to: `${email}`,
					from: process.env.CODE_GMAIL_ADDRESS,
					subject: "Thank you for ordering an online yoga lesson!",
					html: clientHtml
				}
			]

			mailTokenGen.generateToken(function (err, token, access) {
				for (let i=0; i < mailOptions.length; i++) {
					smtpTransport.sendMail(mailOptions[i], function (error, info) {
						if (error) {
	                    	console.log(error);
	                    	res.sendStatus(404);
	                	} else {
	                    	console.log(response);
	                	}
					})
				}
				smtpTransport.close();
			})

			res.sendStatus(204); 
		});
	}).catch(err => {
		res.send(500, { message: err })
	})
}