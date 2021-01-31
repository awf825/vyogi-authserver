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
	  // bookings: [
  //   {
  //     payment_made: true,
  //     cancelled: true,
  //     userId: 1
  //   },
  //   {
  //     payment_made: true,
  //     cancelled: true,
  //     userId: 2
  //   }
  //   ...
  // ]
	// bookings: [{
	//     type: Schema.Types.ObjectId,
	//     ref: "Booking"
 //    }]
})

module.exports = mongoose.model('lesson', lessonSchema)