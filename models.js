const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema({
	invested: Number,
	buyingPower: Number,
	earned: Number,
	totalValue: Number,
	stocks: [{
		symbol: String,
		lastPrice: Number
	}]
});


const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = {
	Portfolio: Portfolio,
}

