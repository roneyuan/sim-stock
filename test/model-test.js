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

	describe('hash-password', function() {
		it('should return hashed password', function() {
			console.log("Password: " + User.hashPassword("123").then((password) => console.log(password)));
			User.hashPassword("123").should.be.a('string');
			User.hashPassword("123").should.equal("123")
		})
	});

});

function connectDB(databaseUrl=TEST_DATABASE_URL) {
	return mongoose.connect(databaseUrl); // mongoose.connect is return as Promise
}

function closeDB() {
	return mongoose.disconnect();
}
