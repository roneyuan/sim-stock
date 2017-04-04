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
});

portfolioSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		invested: this.invested,
		buyingPower: this.buyingPower,
		earned: this.earned,
		totalValue: this.totalValue
	}
}

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

const stockSchema = mongoose.Schema({
	symbol : String,
	price: Number
});

stockSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		symbol: this.symbol,
		price: this.price
	}
}

const Stock = mongoose.model('Stock', stockSchema);


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
	portfolio : [{ type: Schema.Types.ObjectId, ref: 'Portfolio' }], 
	stock: [{type: Schema.Types.ObjectId, ref: 'Stock'}]
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
	Stock: Stock,
	User: User
}

