const bcrypt = require('bcrypt');
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

mongoose.Promise = global.Promise;


const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		//unique: true // Question - When to use unique?
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
		 	stockId: {
		 		stock: {type: Schema.Types.ObjectId, ref: 'Stock'},
		 		quantity: Number
		 	}
		}]
	}
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

module.exports = {User};