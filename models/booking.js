const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let bookingSchema = new Schema({
	payment_made: Boolean,
	cancelled: Boolean,
	userId: Number,
	lessonId: Number
	// user_id: {
	// 	type: Schema.Types.ObjectId,
	// 	ref: "User"
	// },
	// lesson: {
	// 	type: Schema.Types.ObjectId,
	// 	ref: "Lesson"
	// }
})

module.exports = mongoose.model('booking', bookingSchema)