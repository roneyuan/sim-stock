const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const server = require('../server.js');
const mongoose = require('mongoose');

const should = chai.should();

const {user: User} = require('../users');
const {stock: Stock} = require('../users');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedPortfolioData() {
	console.info('seeding Portfolio data');
	const seedData = [];

	for (let i=1; i<=10; i++) {
		seedData.push(generatePortfolioData());
	}

	return User.insertMany(seedData)
}

function generateUsername() {
	const username = [
		'user1', 'usesr2', 'user3', 'user4', 'user5'];
	return username[Math.floor(Math.random() * username.length)];
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
		symbol:symbol[Math.floor(Math.random() * symbol.length)]
		price: price[Math.floor(Math.random() * price.length)]
	}
}

function generatePortfolioData() {
	return {
		username: generateUsername(),
		password: generatePassword(),
		nickname: generateNickname(),
		portfolio: {
			invested: generateInvested(),
			buyingPower: generateBuiyingPower(),
			earned: generateEarned(),
			totalValue: generateTotalValue(),
			investedStocks: generateInvested() // Question here? How do we test with refs and population?
		}
	}
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