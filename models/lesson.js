const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
	title: String, 
	description: String,
	skillLevel: String,
	booked: Boolean,
	startTime: Date,
	cost: Schema.Types.Decimal128,
	bookings: [{
	    type: Schema.Types.ObjectId,
	    ref: "Booking"
    }]
})

module.exports = mongoose.model('lesson', lessonSchema)