const bcrypt = require('bcrypt');
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

// const portfolioSchema = mongoose.Schema({
// 	invested: {
// 		type: Number,
// 		default: 0
// 	},
// 	buyingPower: {
// 		type: Number,
// 		default: 1000000
// 	},
// 	earned: {
// 		type: Number,
// 		default: 0
// 	},
// 	totalValue: {
// 		type: Number,
// 		default: 1000000
// 	},

		// investedStocks: [{
		//  	stock: {type: Schema.Types.ObjectId, ref: 'Stock'},
		//  	quantity: {type}
		// }]
// });

// portfolioSchema.methods.apiRepr = function() {
// 	return {
// 		id: this._id,
// 		invested: this.invested,
// 		buyingPower: this.buyingPower,
// 		earned: this.earned,
// 		totalValue: this.totalValue,

// 	}
// }

// const Portfolio = mongoose.model('Portfolio', portfolioSchema);

const stockSchema = mongoose.Schema({
	_user: { type: String, ref: 'User' },
	symbol : {
		type: String,
		//unique: true // It is unique globally, so if another people want to buy AAPL, then it will prevent you to buy it since
		// it is unique
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	}
});

stockSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		symbol: this.symbol,
		price: this.price,
		//quantity: this.quantity
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
	nickname: {
		type: String, 
		default: ''
	}, 
	portfolio: {
		invested: {
			type: Number,
			default: 0
		},
		buyingPower: {
			type: Number,
			default: 1000000
		},
		earned: {
			type: Number,
			default: 0
		},
		totalValue: {
			type: Number,
			default: 1000000
		},
		investedStocks: [{
		 	stock: {type: Schema.Types.ObjectId, ref: 'Stock'},
		 	//quantity: Number
		}]
	}


	// },
	// 	investedStocks: [{
	// 		symbol: String,
	// 		price: Number,
	// 		quantity: Number
	// 	}]
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
    portfolio: this.portfolio
  };
}

const User = mongoose.model('User', UserSchema);

module.exports = {
	//Portfolio: Portfolio,
	Stock: Stock,
	User: User
}

