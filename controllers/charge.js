const mongoose = require('mongoose');
const config = require('../config.js')

exports.serveToken = function(req, res, next) {
	res.json(config.stripePublishableKeyTest)
}

exports.charge = async function(req, res, next) {
	const Stripe = require('stripe');
	const stripe = Stripe(config.stripeSecretKeyTest)
	const lesson = req.body.lesson

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

	// create booking here, I suppose this is what the response really hinges on

	res.sendStatus(204)
  	
}