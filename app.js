const express = require('express');
const http = require('http'); 
const logger = require('heroku-logger')

const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./router.js');

const mongoose = require('mongoose');
const url = process.env.MONGODB_URL || 'mongodb://localhost:auth/auth'

const app = express();
logger.info('vars after express init', { mongo: process.env.MONGODB_URL, environment: process.env, dbUrl: url })
console.log(process.env.MONGODB_URL)
console.log(process.env)
console.log(url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }))

router(app)

const port = process.env.port || 3090;
const server = http.createServer(app)
server.listen(port);
console.log('server listening on:', port)
