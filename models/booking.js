const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let bookingSchema = new Schema({
	payment_made: Boolean,
	cancelled: Boolean,
	userId: String,
	lessonId: String,
	code: String
})

module.exports = mongoose.model('booking', bookingSchema)