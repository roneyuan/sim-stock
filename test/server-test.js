const chai = require('chai');
const chaiHttp = require('chai-http');
//const faker = require('faker');
const server = require('../server.js');
const mongoose = require('mongoose');

const should = chai.should();

const {User} = require('../users');
const {Stock} = require('../users');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// Question: Are we creating another Stock Schema for testing?

function seedPortfolioData() {
	//console.info('seeding Portfolio data');
	const seedData = [];

	for (let i=1; i<=10; i++) {
		seedData.push(generatePortfolioData());
	}

	//console.log("data " + seedData)
	//console.log("User " + User)
	return User.insertMany(seedData); // Question: Cannot Insert? 
}

function generateUsername() { // Username need to be unique
	const username = [
		'user1', 'usesr2', 'user3', 'user4', 'user5'];
	return Math.floor(Math.random() * 1000000);
}

function generatePassword() {
	const password = ['123', '321', '567'];
	return password[Math.floor(Math.random() * password.length)]
}

function generateNickname() {
	const nickname = [
		'David', 'Owen', 'Peter', 'Joe', 'Kevin'];
	return nickname[Math.floor(Math.random() * nickname.length)]
}

function generateInvested() {
	const invested = [10000, 20000, 3000000, 6000, 700000];
	return invested[Math.floor(Math.random() * invested.length)];
}

function generateBuiyingPower() {
	const buyingPower = [3000, 10000, 200, 90000, 1000000];
	return buyingPower[Math.floor(Math.random() * buyingPower.length)];
}

function generateEarned() {
	const earned = [1000, 30000, 90000, 700000, 50000];
	return earned[Math.floor(Math.random() * earned.length)];
}

function generateTotalValue() {
	const totalValue = [300000, 200000, 900000, 1000000, 80000];
}

function generateInvestedStocks() {
	const symbol = ["AAPL", "KO", "UAA", "MSFT", "VZ"];
	const price = [100, 50, 90, 200, 30];
	return {
		symbol: symbol[Math.floor(Math.random() * symbol.length)],
		price: price[Math.floor(Math.random() * price.length)]
	}
}

function generatePortfolioData() {
	return {
		username: 'user1',
		password: '$2a$10$UAqZpsv1pJukO7WbMGkeR.zs2t07jlbZQ/hKl22zUdPwciqFJTgWq',
		nickname: 'user',
		portfolio: {
			invested: 200000,
			buyingPower: 800000,
			earned: 100000,
			totalValue: 1100000,
			investedStocks: [{symbol: "AAPL", price:100}] // Question here? How do we test with refs and population?
		}
	}
}


function tearDownDb() {
	console.warn('Deleting database');
	//return mongoose.connection.dropDatabase();
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
		let res;
		it('should return all existing portfolios', function() {
			return chai.request(app)
				.get('/users/user1') // Question Authorize Error? Any encryotion or hash is going on?
				.auth('user1', '1') // password is hash
				.then(function(res) {
					res.should.have.status(200);
					res.should.be.json;
					//res.body.should.be.a('array');
				})
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