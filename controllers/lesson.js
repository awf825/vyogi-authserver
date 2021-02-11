const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');

exports.getAll = async function(req, res, next) {
	Lesson.find({}, function(err, result) {
	    if (err) {
	      console.log(err);
	    } else {
	      res.json(result);
	    }
	});
}

// exports.getCurrentLesson = async function(req, res, next) {
// 	var now = + new Date()
// 	let currentLesson = await Lesson.find( { startTime: { $lt: now } } ).sort( { $natural: -1 } ).limit(1);
// 	res.json({ lesson: currentLesson })
// // 	res.json({ codes: payload })
// }
