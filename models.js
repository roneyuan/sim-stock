const bcrypt = require('bcrypt');
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const portfolioSchema = mongoose.Schema({
	invested: {
		type: Number,
		default: 0
	},
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
	nickname: {type: String, default: ''},
	portfolio : [{ type: Schema.Types.ObjectId, ref: 'Portfolio' }] // maybe? but how do we access and manipulate?

	// invested: {
	// 	type: Number,
	// 	default: 0
	// },
	// buyingPower: {
	// 	type: Number,
	// 	default: 1000000
	// },
	// earned: {
	// 	type: Number,
	// 	default: 0
	// },
	// totalValue: {
	// 	type: Number,
	// 	default: 1000000
	// },
	// stocks: [{
	// 	symbol: String,
	// 	lastPrice: Number
	// }]
});

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
	console.log(password);
	return bcrypt.hash(password, 10);
}

UserSchema.methods.apiRepr = function() {
  return {
  	id: this.id,
    username: this.username || '',
    nickname: this.nickname || '',
    //portfolio: this.portfolio

  };
}

const User = mongoose.model('User', UserSchema);




module.exports = {
	Portfolio: Portfolio,
	User: User
}

