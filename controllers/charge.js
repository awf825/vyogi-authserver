const mongoose = require('mongoose');
const Booking = require('../models/booking.js')
const User = require('../models/user.js')
const Lesson = require('../models/lesson.js')
// const webEnvs = ['beta', 'production']
const pubKey = process.env.STRIPE_PUBLISHABLE_KEY_TEST;
const stripeSecret = process.env.STRIPE_SECRET_KEY_TEST;

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
		lessonId: lesson
	});

	try {
		charge = await stripe.charges.create({
	  		amount: req.body.cost*1000,
	  		currency: 'usd',
	  		source: req.body.token,
	  		description: 'My Test Charge API docs',
		});
	} catch (err) {
		res.send(500, { message: 'broke on stripe' })
	}

	await newBooking.save(function (err, booking) {
		if (err) return handleError(err);
		let code = Math.random().toString(36).substring().split('.')[1];
		User.findOneAndUpdate(
			userQuery, 
			{ 
				"$push": { 
					"bookings": { 
						"_id": booking._id, 
						"lessonId": mongoose.Types.ObjectId(lesson),
						"code": code
					}
				} 
			}, function(err, doc) {
				if (err) return res.send(500, {error: err});
			} 
		);
		Lesson.findOneAndUpdate(
			lessonQuery, 
			{ 
				"$push": { 
					"bookings": { 
						"_id": booking._id, 
						"userId": mongoose.Types.ObjectId(user),
						"code": code
					}
				} 
			}, function(err, doc) {
				if (err) return res.send(500, {error: err});
			} 
		);
		res.sendStatus(204);
	});
}
