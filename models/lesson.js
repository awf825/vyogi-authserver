const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
	title: String, 
	description: String,
	skillLevel: String,
	booked: Boolean,
	startTime: Number,
	cost: Number,
	bookings: Array
},
	{ collection: 'lesson' }
)

module.exports = mongoose.model('lesson', lessonSchema)