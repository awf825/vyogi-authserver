const fs = require('fs');
let seeds = [];

for (i = 0; i < 1200; i++) {
	const now = + new Date();
	var h = i*3600000
	var seed = {
		title: `Test Lesson ${i}`,
		description: "desc",
		skillLevel: null,
		booked: false,
		startTime: ( now + h ),
		cost: 8,
		bookings: []
	}
	seeds.push(seed)
};

fs.writeFile(`./schemas/lessons/${new Date()}.json`, JSON.stringify(seeds), function (err) {
  if (err) throw err;               
  console.log('Results Received');
}); 

// return seeds