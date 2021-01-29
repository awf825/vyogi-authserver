const Lesson = require('../models/lesson.js');
const mongoose = require('mongoose');

exports.getAll = async function(req, res, next) {
	let payload = await Lesson.find({});
	res.json({ lessons: payload })
}