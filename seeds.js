const fs = require('fs');

Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000));
   return this;
};

let seeds = [];

for (i = 0; i < 35; i++) {
	var seed = {
		title: `Test Lesson ${i}`,
		description: "desc",
		skillLevel: null,
		booked: false,
		startTime: new Date().addHours(i).toLocaleString('en-US', { timeZone: 'America/New_York' }),
		cost: 7.50,
		bookings: []
	}
	seeds.push(seed)
};

fs.writeFile(`./schemas/${new Date()}.json`, JSON.stringify(seeds), function (err) {
  if (err) throw err;               
  console.log('Results Received');
}); 

// return seeds