const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {DATABASE_URL, PORT} 	= require('./config');

const app = express();

app.use(bodyParser.json());

// Database models
//const {MarketData} = require('./models');

// Router
const portfolioRouter = require('./portfolioRouter');

app.use(morgan('common'));
app.use(express.static('public'));


mongoose.Promise = global.Promise;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.use('/portfolio', portfolioRouter);

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	console.log(port);
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if(err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`The app is running on port ${port}`);
				resolve(server);
			}).on('error', err => {
				reject(err);
			})
		})
	})
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing Server');
			server.close(err => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			})
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer}

