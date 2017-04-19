const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User} = require('./user');
const {Stock} = require('./stock');

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
	    return User
		  	.create({			
		  		username: username,
		      password: hash,
		      nickname: nickname,
		      portfolio: req.body.portfolio
				})
				.then(user => {
		      return res.status(201).json(user.apiRepr());
		    })
		    .catch(err => {
		    	console.log(err)
		      res.status(500).json({message: 'Internal server error'})
		    });	
    });
});


/*
By default, if authentication fails, Passport will respond with a 401 Unauthorized status, 
and any additional route handlers will not be invoked. 
If authentication succeeds, the next handler will be invoked 
and the req.user property will be set to the authenticated user.
*/
router.get('/:username',
  passport.authenticate('basic', {session: false}),
  function (req, res) { 
  	res.json({user: req.user.apiRepr()}); 
  }
);

router.get('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio.investedStocks.stockId.stock')   
		.exec(function(err, user) {
			res.status(200).json(user);
		});
});

router.post('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	Stock
		.create({
			symbol: req.body.symbol,
			price: req.body.price,
			quantity: req.body.quantity	
		})
		.then(stock => {
			return User
				.findOneAndUpdate({username:req.user.username}, 
				{
					$push: { 
						"portfolio.investedStocks": {
								'stockId.stock': stock._id,
								'stockId.quantity': req.body.quantity			
						}	
					}
				})
				.exec()
				.then(user => {
					res.status(204).end();
				})
				.catch(err => {
					console.log(err);
				})
		})
	}
);

router.put('/:username/stock/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}

	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock') 
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let selectedId;
			console.log("Stocks " + stocks);
			for (let i=0; i<stocks.length; i++) {
				console.log(stocks[i]._id)
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					user.portfolio.investedStocks[i].stockId.quantity = req.body.quantity;
				}
			}

			user.save((err) => {
				if (err) {
					console.log(err)
				}
			})

			res.json(user);
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});						
});

router.put('/:username/stock/:symbol/:price', passport.authenticate('basic', {session: false}), (req, res) => {
	if (req.params.price !== req.body.price || req.params.symbol !== req.body.symbol) {
			return res.status(400).send("Request field does not match");	
	}

	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock')
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					user.portfolio.investedStocks[i].stockId.stock.price = req.body.price;
				}
			}

			user.save((err) => {
				if (err) {
					console.log(err)
				}
			})

			res.json(user);
		}) 
		.catch(err => {
			console.log(err);
			res.status(500).json({error: 'Error'})
		});		
});

// GET all the stock price

// GET total value



// router.delete('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
// 		Stock
// 			.findOneAndRemove({symbol: req.params.symbol})
// 			.exec()
// 			.then(stock => res.status(204).end())
// 			.catch(err => res.status(500).json({error: 'Error'}));
// 	}
// );


module.exports = {router};