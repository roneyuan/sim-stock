// Does not need chaihttp becuase we are not going to use http
// server-test.js is Integration Test

const chai = require('chai');
//const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const {User} = require('../users');
//const {Stock} = require('../users');
//const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

mongoose.Promise = global.Promise;

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}


describe('Hash password', function() {

	before(function() {
		return connectDB(TEST_DATABASE_URL);
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeDB();
	});

	// How do I do for Google Oauth?


	// Does not need for Google Strategy
	xdescribe('hash-password', function() {
		it('should return hashed password', function() { // If you put done in the parameter, it will give you For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
			console.log("Password: " + User.hashPassword("1").then((password) => console.log(password)));
			return User.hashPassword("1").should.eventually.be.a('string');
		});


	});

});

function connectDB(databaseUrl=TEST_DATABASE_URL) {
	return mongoose.connect(databaseUrl); // mongoose.connect is return as Promise
}

function closeDB() {
	return mongoose.disconnect();
}
