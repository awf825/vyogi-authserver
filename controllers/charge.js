const mongoose = require('mongoose');
const config = require('../config.js')
const Booking = require('../models/booking.js')
const User = require('../models/user.js')
const Lesson = require('../models/lesson.js')

exports.serveToken = function(req, res, next) {
	res.json(config.stripePublishableKeyTest)
}

exports.charge = async function(req, res, next) {
	const Stripe = require('stripe');
	const stripe = Stripe(config.stripeSecretKeyTest);
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
		User.findOneAndUpdate(
			userQuery, 
			{ 
				"$push": { 
					"bookings": { 
						"_id": booking._id, 
						"lessonId": mongoose.Types.ObjectId(lesson) 
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
						"userId": mongoose.Types.ObjectId(user) 
					} 
				} 
			}, function(err, doc) {
				if (err) return res.send(500, {error: err});
			} );
		res.sendStatus(204);
	});
}
