const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

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

portfolioSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		invested: this.invested,
		buyingPower: this.buyingPower,
		earned: this.earned,
		totalValue: this.totalValue,
		stocks: this.stocks
	}
}

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	nickname: {type: String, default: ''}
});

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
}

UserSchema.static.hashPassword = function(password) {
	console.log(password);
	return bcrypt.hash(password, 10);
}

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    nickname: this.nickname || ''
  };
}

const User = mongoose.model('User', UserSchema);




module.exports = {
	Portfolio: Portfolio,
	User: User
}

