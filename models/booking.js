const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let bookingSchema = new Schema({
	payment_made: Boolean,
	cancelled: Boolean,
	userId: String,
	lessonId: String,
	chargeId: String,
	refundId: String,
	lessonCost: Number,
	lessonStart: String,
	lessonEnd: String,
	pregnancyCheck: String,
	practiced: String,
	limitations: String,
	focus: String,
	needToKnow: String,
	code: String,
	createdAt: Date
},
	{ collection: "booking" }
)

module.exports = mongoose.model('booking', bookingSchema)