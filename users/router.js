const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();
const passport = require('passport');
const fs = require('fs');
const {User} = require('./user');
const {Stock} = require('./stock');

router.use(jsonParser);
router.use(passport.initialize());

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;


passport.use(new GoogleStrategy({
    clientID:  '603515610903-ov1hu4kjoghb028raqlmb2ndd4761re1.apps.googleusercontent.com',
    clientSecret: "K5NBv_fDAp6YcyZJQfNofxVb",
    callbackURL: "/users/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log("Google!!!");
		return User
	  	.findOrCreate({			
	  		username: profile.id,
			}, 
			{
				password: accessToken,
	      nickname: profile.displayName,
			}, (err, user) => {
				return done(null, user);
			});
  } 
));


// Bearer Strategy - compare token
// Why no console log no output?
// The reason is that if you use 'bearer' in passport.authenticate, 
// that is the built-in method. So You will never be able to call
// your own stretegy. To do that, you need to name your strategy
passport.use('mybearer', new BearerStrategy(
  function(token, done) {
    User.findOne({ password: token }, function (err, user) {
    	// console.log(user);
      if (err) { 
      	return done(err); 
      }
      if (!user) {
      	return done(null, false); 
      }

      return done(null, user, { scope: 'all' });
    });
  }
));

// Go to login page from Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }));

// Callback from , but stuck here
router.get('/auth/google/callback',
  passport.authenticate('google',{failureRedirect: '/login', session: false}),
  function(req, res) {
    // Authenticated successfully
    res.redirect("/home.html?access_token=" + req.user.password);
  });


/***
For test only
***/
// router.get('/:username',
//   passport.authenticate('bearer', {session: false}),
//   function (req, res) { 
//   	res.json({user: req.user.apiRepr()}); 
//   }
// );


/***
Get stock list
***/
router.get('/:username/stock', passport.authenticate('mybearer', {session: false}), (req, res) => {
	//console.log("REQ STOCK:", req.stock); 
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio.investedStocks.stockId.stock')   
		.exec(function(err, user) {
			res.status(200).json(user);
		});
});


/***
Buy new stock
***/
router.post('/:username/stock', passport.authenticate('mybearer', {session: false}), (req, res) => {
	Stock
		.create({
			symbol: req.body.symbol,
			price: req.body.price,
			currentPrice: req.body.price,
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
						return User
							.findOne({username: req.user.username}) //
							.populate('portfolio.investedStocks.stockId.stock')   
							.exec(function(err, user) {
								res.json(user);
						});
					// res.status(201).json(user);
				})
				.catch(err => {
					console.log(err);
				})
		})
		.catch(err => {
			console.log(err);
		})
	}
);


/***
Buy and Sell update
***/
router.put('/:username/stock/:symbol', passport.authenticate('mybearer', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}

	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock') 
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let selectedId;
			let updateStockId;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					user.portfolio.investedStocks[i].stockId.quantity = req.body.quantity;
					updateStockId = user.portfolio.investedStocks[i].stockId.stock["_id"];
				}
			}

			user.save((err) => {
				if (err) {
					console.log("Save and Update error", err)
				}
			});

			return Stock
				.findById(updateStockId)
				.exec()
				.then(stock => {
					stock.currentPrice = req.body.price;

					// Future optimization: Calculate avg price
					stock.price = req.body.price;
					stock.save((err) => {
						if (err) {
							console.log("Stock save errror: ", err)
						}
					});
					res.status(204).json(stock);
				})
				.catch(err => {
					console.log("Update Stock Error: " + err);
				});
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});						
});

/***
Buy update
***/
router.put('/:username/stock/:symbol/buy', passport.authenticate('mybearer', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}
	let currentQuantity;
	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock') 
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let selectedId;
			let updateStockId;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					// Get the quantiy
					currentQuantity = user.portfolio.investedStocks[i].stockId.quantity;
					user.portfolio.investedStocks[i].stockId.quantity = req.body.quantity;
					updateStockId = user.portfolio.investedStocks[i].stockId.stock["_id"];
				}
			}

			user.save((err) => {
				if (err) {
					console.log("Save and Update error", err)
				}
			});

			return Stock
				.findById(updateStockId)
				.exec()
				.then(stock => {
					stock.currentPrice = req.body.price;
					console.log(req.body.quantity);
					console.log(currentQuantity);
					let newPrice = ((req.body.quantity-currentQuantity)*req.body.price + (currentQuantity*stock.price))/(req.body.quantity);
					console.log("New Price", newPrice);
					stock.price = newPrice.toFixed(2);
					stock.save((err) => {
						if (err) {
							console.log("Stock save errror: ", err)
						}
					});
					res.status(204).json(stock);
				})
				.catch(err => {
					console.log("Update Stock Error: " + err);
				});
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});						
});

/***
Sell update
***/
router.put('/:username/stock/:symbol/sell', passport.authenticate('mybearer', {session: false}), (req, res) => {
	if (req.params.symbol !== req.body.symbol) {
		return res.status(400).send("Request field does not match");
	}

	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock') 
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let selectedId;
			let updateStockId;
			let currentQuantity;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					currentQuantity = user.portfolio.investedStocks[i].stockId.quantity;
					user.portfolio.investedStocks[i].stockId.quantity = req.body.quantity;
					updateStockId = user.portfolio.investedStocks[i].stockId.stock["_id"];
				}
			}

			user.save((err) => {
				if (err) {
					console.log("Save and Update error", err)
				}
			});

			return Stock
				.findById(updateStockId)
				.exec()
				.then(stock => {
					stock.currentPrice = req.body.price;

					// Future optimization: Calculate earned
					// 1. Get the sell quantity
					// 2. Earned = (currentPrice - buyInPrice) * quantity sell
					// 3. Update earned

					console.log("Current Quantity", currentQuantity);
					console.log("Stock Price", stock.price);
					console.log("Request quantity", req.body.quantity);
					console.log("Price now", req.body.price);

					let earned = (req.body.price - stock.price) * (req.body.quantity-currentQuantity);
				
					user.portfolio.earned += earned;

					user.save((err) => {
						if (err) {
							console.log("User save errror: ", err)
						}
					});
					res.status(204).json(stock);
				})
				.catch(err => {
					console.log("Update Stock Error: " + err);
				});
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});						
});



/***
Update current price for stock TODO
***/
router.put('/:username/stock/:symbol/:price', passport.authenticate('mybearer', {session: false}), (req, res) => {
	if (req.params.price !== req.body.price || req.params.symbol !== req.body.symbol) {
			return res.status(400).send("Request field does not match");	
	}

	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock') 
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let updateStockId;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					updateStockId = user.portfolio.investedStocks[i].stockId.stock["_id"];
				}
			}

			return Stock
				.findById(updateStockId)
				.exec()
				.then(stock => {
					stock.currentPrice = req.body.price;

					stock.save((err) => {
						if (err) {
							console.log("Stock save error: ", err)
						}
					});
					res.status(204).json(stock);
				})
				.catch(err => {
					console.log("Update Stock Price Error: " + err);
				});
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});				
});

router.get('/:username/stock/:symbol', passport.authenticate('mybearer', {session: false}), (req, res) => {
	return User
		.findOne({username: req.user.username})
		.populate('portfolio.investedStocks.stockId.stock')
		.exec((err, user) => {
			let stocks = user.portfolio.investedStocks;
			let findStock;
			for (let i=0; i<stocks.length; i++) {
				if (stocks[i].stockId.stock.symbol === req.params.symbol) {
					findStock = user.portfolio.investedStocks[i].stockId.stock["_id"];
				}				
			}

			return Stock
				.findById(findStock)
				.exec()
				.then(stock => {
					res.status(200).json(stock.apiRepr());
				})
				.catch(err => {
					console.log("Find Stock Error: " + err);
				});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: 'Error'})
		})
});

router.put('/:username/updateEarned', passport.authenticate('mybearer', {session: false}), (req, res) => {
	var earned = req.body.earned
	// Update earned in user
	// 1. Get current earned
	// 2. Sum up
	// 3. Update
})


module.exports = {router};