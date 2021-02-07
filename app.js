const express = require('express');
const http = require('http'); 
const bodyParser = require('body-parser');
const router = require('./router.js');
const mongoose = require('mongoose');
const cors = require('cors');
const url = process.env.MONGODB_URL || 'mongodb://localhost:auth/auth'
const app = express();

try {
	mongoose.connect( url, {useNewUrlParser: true, useUnifiedTopology: true }); 

	const connection = mongoose.connection;

	connection.once("open", function() {
	  console.log("MongoDB database connection established successfully");
	});
} catch (error) { 
	console.log("could not connect, error:", error);    
}

app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));

router(app);

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('server listening on:', port);
