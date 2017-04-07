const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User, Portfolio, Stock} = require('./models');

router.use(jsonParser);

const basicStrategy = new BasicStrategy((username, password, done) => {
	let user;
	User
		.findOne({username: username})
		.exec()
		.then(_user => {
			// console.log(password)
			user = _user;
			if (!user) {
				return done(null, false, {message: 'Invalid username'});
			}
			return user.validatePassword(password);

		})
		.then(isValid => {
			if (!isValid) {
				return done(null, false, {message: 'Invalid password'});
			} else {
				return done(null, user);
			}

		});
});

passport.use(basicStrategy); 
router.use(passport.initialize());


router.post('/', (req, res) => {
	// console.log(req.body)
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password, nickname} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }

  if (!(password)) {
    return res.status(422).json({message: 'Missing field: password'});
  }

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }

  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }

      return User.hashPassword(password)
    })
    .then(hash => {
	    return Portfolio
	  	.create({			
	  		invested: req.body.invested,
				buyingPower: req.body.buyingPower,
				earned: req.body.earned,
				totalValue: req.body.totalValue
			}).then(portfolio => {
	      return User
	        .create({
	          username: username,
	          password: hash,
	          nickname: nickname,
	          portfolio: portfolio._id
	        })
			}).then(user => {
	      return res.status(201).json(user.apiRepr());
	    }).catch(err => {
	    	console.log(err)
	      res.status(500).json({message: 'Internal server error'})
	    });	
    });
});

router.get('/:username',
  passport.authenticate('basic', {session: false}),
  function (req, res) { 
  	res.json({user: req.user.apiRepr()});
  }
);

router.get('/:username/portfolio', passport.authenticate('basic', {session: false}), (req, res) => {
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio')   
		.exec(function(err, user) {
			console.log(err);
			console.log(user.portfolio);
			res.status(200).json(user);
		});
});

// Question: Stock is not bind to the account. Every user can manipulate the account
router.get('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	return Stock
		.find()
		.exec()
		.then(stock => {
			res.status(200).json(stock)
		})
		.catch(err => {
			console.log(err)
		})
})

router.post('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	Stock
		.create({
			symbol: req.body.symbol,
			price: req.body.price,
			quantity: req.body.quantity
		})
		.then(stock => res.status(201).json(stock.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'Error!'});
		});
	}
);

router.put('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}

	Stock
		.findOneAndUpdate({symbol: req.body.symbol}, {quantity: req.body.quantity, price: req.body.price})
		.exec()
		.then(stock => res.status(204).end()) // Question: Why not return a object? A tradition?
		.catch(err => {
			console.log(err);
			res.status(500).json({error: 'Error'})
		});
	}
);

router.delete('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
		Stock
			.findOneAndRemove({symbol: req.params.symbol})
			.exec()
			.then(stock => res.status(204).end())
			.catch(err => res.status(500).json({error: 'Error'}));
	}
);


module.exports = router;