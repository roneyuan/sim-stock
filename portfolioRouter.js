const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Portfolio} = require('./models');

mongoose.Promise = global.Promise;


Portfolio
	.create({
		invested: 100,
		buyingPower: 1000,
		earned: 100,
		totalValue: 100,
		stocks: [{
			symbol: "AAPL",
			lastPrice: 20
		}]		
	})

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

});

router.delete('/:id', (req, res) => {

});

router.put('/:id', jsonParser, (req, res) => {

});

module.exports = router;