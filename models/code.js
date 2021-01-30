const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let codeSchema = ({
	access: Number, 
	userId: String
    // user: {
    // 	type: Schema.Types.ObjectId,
    // 	ref: "User"
    // }
})

module.exports = mongoose.model('code', codeSchema)