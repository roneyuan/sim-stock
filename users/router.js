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
    callbackURL: "http://localhost:8080/users/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
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

// Go to login page from Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }));

// Callback from , but stuck here
router.get('/auth/google/callback',
  passport.authenticate('google',{failureRedirect: '/login', session: false}),
  function(req, res) {
    // Authenticated successfully
    res.redirect("/index.html?access_token=" + req.user.password);
  });

// Bearer Strategy
passport.use(new BearerStrategy(
  function(token, done) {
    User.findOne({ password: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));

router.get('/:username',
  passport.authenticate('bearer', {session: false}),
  function (req, res) { 
  	res.json({user: req.user.apiRepr()}); 
  	// res.redirect('/index.html');
  }
);

router.get('/:username/stock', passport.authenticate('bearer', {session: false}), (req, res) => {
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio.investedStocks.stockId.stock')   
		.exec(function(err, user) {
			console.log(user.portfolio.investedStocks[0].stockId.stock)
			res.status(200).json(user);
		});
});

router.post('/:username/stock', passport.authenticate('bearer', {session: false}), (req, res) => {
	console.log(req.body.symbol)
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
					//console.log("SucCESS")
					res.status(201).end();
				})
				.catch(err => {
					console.log(err);
				})
		})
	}
);

router.put('/:username/stock/:symbol', passport.authenticate('bearer', {session: false}), (req, res) => {
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
			//console.log("Stocks " + stocks);
			for (let i=0; i<stocks.length; i++) {
				//console.log(stocks[i]._id)
				if (stocks[i].stockId.stock.symbol === req.body.symbol) {
					selectedId = stocks[i].id;
					user.portfolio.investedStocks[i].stockId.quantity = req.body.quantity;
					updateStockId = user.portfolio.investedStocks[i].stockId.stock["_id"]
					//console.log("Before: " + user.portfolio.investedStocks[i].stockId.stock.price);
					
					//user.portfolio.investedStocks[i].stockId.stock.price = req.body.price;
					
					//console.log("After: " + user.portfolio.investedStocks[i].stockId.stock.price);
					console.log("Check: " + user.portfolio.investedStocks[i].stockId)
				}
			}

			user.save((err) => {
				if (err) {
					console.log(err)
				}
			});

			return Stock
				.findById(updateStockId)
				.exec()
				.then(stock => {
					console.log("Stock: " + stock)
					stock.price = req.body.price;

					stock.save((err) => {
						if (err) {
							console.log(err)
						}
					});
					res.status(204).json(stock);
				})
				.catch(err => {
					console.log("Update Stock Error: " + err);
				});

			//console.log("After save: " + user.portfolio.investedStocks[0].stockId.stock["_id"])
			//res.json(user);
	}) 
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Error'})
	});						
});

router.put('/:username/stock/:symbol/:price', passport.authenticate('bearer', {session: false}), (req, res) => {
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

//router.



module.exports = {router};