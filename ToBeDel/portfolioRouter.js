const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Portfolio} = require('./models');

mongoose.Promise = global.Promise;


router.get('/', (req, res) => {
	Portfolio
		.find()
		.exec()
		.then(portfolio => {
			res.json(portfolio.map(elem => elem.apiRepr()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'Error!'});
		});
	}
);

router.post('/', jsonParser, (req, res) => {
	Portfolio
		.create({
			invested: req.body.invested,
			buyingPower: req.body.buyingPower,
			earned: req.body.earned,
			totalValue: req.body.totalValue,
			stocks: req.body.stocks
		})
		.then(portfolio => res.status(201).json(portfolio.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'Error!'});
		});
	}
);

router.delete('/:id', (req, res) => {

});

router.put('/:id', jsonParser, (req, res) => {

});

module.exports = router;