var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');

var should = chai.should();
var app = server.app;

const {Portfolio} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedPortfolioData() {

}

function generatePortfolioData() {

}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Portfolio API resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedPortfolioData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {
		it('should return all existing portfolios', function() {

		});
	});

	describe('POST endpoint', function() {
		it('should return all existing portfolios', function() {

		});
	});

	describe('PUT endpoint', function() {
		it('should return all existing portfolios', function() {

		});
	});

	describe('DELETE endpoint', function() {
		it('should return all existing portfolios', function() {

		});
	});			
});