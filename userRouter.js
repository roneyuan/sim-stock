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
  	res.json({user: req.user.apiRepr()}); // Question: Where is req.user came from? Ans: It is part of passport.js
  }
);

// Question: Stock is not bind to the account. Every user can manipulate the account
router.get('/:username/stock', passport.authenticate('basic', {session: false}), (req, res) => {
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio.investedStocks.stock')   
		.exec(function(err, user) {
			//console.log(err);
			//console.log(user.portfolio.investedStocks);
			res.status(200).json(user);
		});
})

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
						"portfolio.investedStocks": { // Use dot notation to push ! USe double quote!
								stock: stock._id,
								//quantity: req.body.quantity			
						}	
					}
				})
				.exec()
				.then(user => {
					//console.log(user);
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


	// return User
	// 	.find({'portfolio.investedStocks.stock': '58ec3d4bd999eb44eb602f3e'})
	// 	.exec()
	// 	.then(user => {
	// 		console.log(user[0].portfolio.investedStocks);
	// 	}) // then how to update quantity?

	return User
	.findOne({username: req.user.username})
	.populate('portfolio.investedStocks.stock')
	.exec((err, user) => {
		//console.log("Find User: " + user.portfolio.investedStocks);
		let stocks = user.portfolio.investedStocks;
		let selectedId;
		console.log("Stocks " + stocks)
		for (let i=0; i<stocks.length; i++) {
			if (stocks[i].stock.symbol === req.body.symbol) {
				selectedId = stocks[i].stock._id;
			}
		} 
		// Then we can use this id to update quantity
		console.log("ID " + selectedId);
		return Stock
			.findOneAndUpdate({_id: selectedId}, {quantity:req.body.quantity})
			.exec()
			.then(stock => { 
				res.status(204).end();
				console.log("Find: " + stock);
				return User
					.findOne({username: req.user.username})
					.populate('portfolio.investedStocks.stock')
					.exec((err, user) => {
						//console.log("Find User: " + user.portfolio.investedStocks);
					})
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({error: 'Error'})
			});					
	})

	// return Stock
	// 	.findOneAndUpdate({_id: "58ec4895a21ed4456634b600"}, {quantity:req.body.quantity})
	// 	.exec()
	// 	.then(stock => { 
	// 		res.status(204).end();
	// 		console.log("Find: " + stock);
	// 		return User
	// 			.findOne({username: req.user.username})
	// 			.populate('portfolio.investedStocks.stock')
	// 			.exec((err, user) => {
	// 				console.log("Find User: " + user.portfolio.investedStocks);
	// 			})
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 		res.status(500).json({error: 'Error'})
	// 	});				
});

router.delete('/:username/stocks/:symbol', passport.authenticate('basic', {session: false}), (req, res) => {
		Stock
			.findOneAndRemove({symbol: req.params.symbol})
			.exec()
			.then(stock => res.status(204).end())
			.catch(err => res.status(500).json({error: 'Error'}));
	}
);


module.exports = router;