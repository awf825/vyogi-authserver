const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');

exports.getAll = async function(req, res, next) {
	let payload = await Lesson.find({});
	res.json({ lessons: payload })
}

exports.getCodesFromCurrentLesson = async function(req, res, next) {
	var now = + new Date()
	let currentLesson = await Lesson.find( { startTime: { $lt: now } } ).sort( { $natural: -1 } ).limit(1);
	
	res.json({ l: currentLesson })
// 	res.json({ codes: payload })
}
