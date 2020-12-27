const express = require('express');
const http = require('http'); 
const logger = require('heroku-logger')

const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./router.js');
const mongoose = require('mongoose');
const cors = require('cors');
const url = process.env.MONGODB_URL || 'mongodb://localhost:auth/auth'

const app = express();
//mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

try {
	mongoose.connect( url, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
		console.log("connected")
	);    
} catch (error) { 
	console.log("could not connect, error:", error);    
}

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));

router(app);

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('server listening on:', port);
