var ObjectId = require('mongodb').ObjectID;
const fs = require('fs');

// Whatever users you made via browser, curl, etc
const clients = [
	"6014cc593f494f08474ea178",
	"6014cc6e3f494f08474ea179",
	"6014cc7e3f494f08474ea17a",
	"6014cc923f494f08474ea17b",
	"6014ccb03f494f08474ea17c" 
]

const lessons = [
	"601392a23023ea918342ac00",
	"601392a23023ea918342ac01",	
	"601392a23023ea918342ac02",		 
	"601392a23023ea918342ac03",			
	"601392a23023ea918342ac04"
]
	
let seeds = [];
let u = 0
let l = 0

for (i = 0; i < 12; i++) {
	if (i%5 === 0) {
		u = 0
		l++
	} else {
		u++
	}

	const userId = clients[u]
	const lessonId = lessons[l]

	var seed = {
		payment_made: true,
		cancelled: false,
		userId: 
			_id: ObjectId(userId)
		},
		lesson: {
			_id: ObjectId(lessonId)

		}
	}
	seeds.push(seed)
};

fs.writeFile(`./schemas/bookings/${new Date()}.json`, JSON.stringify(seeds), function (err) {
  if (err) throw err;               
  console.log('Results Received');
}); 
