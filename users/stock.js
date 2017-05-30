
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const stockSchema = mongoose.Schema({
	_user: { type: String, ref: 'User' },
	symbol : {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	currentPrice: {
		type: Number,
		required: true
	}
});

stockSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		symbol: this.symbol,
		price: this.price,
		currentPrice: this.currentPrice,
		quantity: this.quantity
		// Need sell at
	}
}

const Stock = mongoose.model('Stock', stockSchema);

module.exports = {Stock};

