const mongoose = require('mongoose');
const config = require('../config.js')
const Booking = require('../models/booking.js')

exports.serveToken = function(req, res, next) {
	res.json(config.stripePublishableKeyTest)
}

exports.charge = async function(req, res, next) {
	const Stripe = require('stripe');
	const stripe = Stripe(config.stripeSecretKeyTest);
	const lesson = req.body.lesson;
	const user = req.body.user;

	try {
		charge = await stripe.charges.create({
	  		amount: req.body.cost*1000,
	  		currency: 'usd',
	  		source: req.body.token,
	  		description: 'My Test Charge API docs',
		});

	} catch (err) {
		res.sendStatus(500)
	}

	const newBooking = new Booking({
		payment_made: true,
		cancelled: false,
		userId: user,
		lessonId: lesson
	});

	newBooking.save(function (err) {
		if (err) return handleError(err);
		// INJECT USER AND LESSON FORM PAYLOAD
		// INTO BOOKING
		res.sendStatus(204);
	});

  	
}