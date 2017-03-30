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
	nickName: {type: String, default: ''}
});

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', UserSchema);




module.exports = {
	Portfolio: Portfolio,
	User: User
}

