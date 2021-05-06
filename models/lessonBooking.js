const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonBookingSchema = new Schema({
	calendarEventId: String
},
	{ collection: 'lessonBooking' }
)

module.exports = mongoose.model('lessonBooking', lessonBookingSchema)