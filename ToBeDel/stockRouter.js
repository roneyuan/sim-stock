const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User, Portfolio, Stock} = require('./models');

router.use(jsonParser);

const basicStrategy = new BasicStrategy((username, password, done) => {
	let user;
	User
		.findOne({username: username})
		.exec()
		.then(_user => {
			// console.log(password)
			user = _user;
			if (!user) {
				return done(null, false, {message: 'Invalid username'});
			}
			return user.validatePassword(password);

		})
		.then(isValid => {
			if (!isValid) {
				return done(null, false, {message: 'Invalid password'});
			} else {
				return done(null, user);
			}

		});
});

passport.use(basicStrategy); 
router.use(passport.initialize());


// Question: Stock is not bind to the account. Every user can manipulate the account
router.get('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	return Stock
		.find()
		.exec()
		.then(stock => {
			res.status(200).json(stock)
		})
		.catch(err => {
			console.log(err)
		})
})

router.post('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	Stock
		.create({
			symbol: req.body.symbol,
			price: req.body.price,
			quantity: req.body.quantity
		})
		.then(stock => res.status(201).json(stock.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'Error!'});
		});
	}
);

router.put('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}

	Stock
		.findOneAndUpdate({symbol: req.body.symbol}, {quantity: req.body.quantity, price: req.body.price})
		.exec()
		.then(stock => res.status(204).end()) // Question: Why not return a object? A tradition?
		.catch(err => {
			console.log(err);
			res.status(500).json({error: 'Error'})
		});
	}
);

router.delete('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
		Stock
			.findOneAndRemove({symbol: req.params.symbol})
			.exec()
			.then(stock => res.status(204).end())
			.catch(err => res.status(500).json({error: 'Error'}));
	}
);
