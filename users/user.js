const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-find-or-create');
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

UserSchema.plugin(findOrCreate);

UserSchema.methods.validatePassword = function(password, callback) {
	return bcrypt.compare(password, this.password, function(err, isValid) {
		if (err) {
			callback(err);
		} 
		callback(null, isValid);
	});
}

UserSchema.statics.hashPassword = function(password) {
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