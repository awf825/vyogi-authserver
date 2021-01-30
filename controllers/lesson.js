const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');

exports.getAll = async function(req, res, next) {
	let payload = await Lesson.find({});
	res.json({ lessons: payload })
}

// exports.checkCodes = function(req, res, next) {
// 	let 
// }
  // def check_access_codes
  //   render json: AccessCode.where(lesson_id: @current_lesson.id).pluck(:code) + [ENV['MASTER_KEY']]
  // end

