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


var database = {}

passport.serializeUser(function(user, done) {
  // done(null, user.id);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // Users.findById(obj, done);
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID:  '603515610903-ov1hu4kjoghb028raqlmb2ndd4761re1.apps.googleusercontent.com',
    clientSecret: "K5NBv_fDAp6YcyZJQfNofxVb",
    callbackURL: "http://localhost:8080/users/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  		console.log("Callback");
  		User
		  	.create({			
		  		username: profile.id,
		      password: accessToken,
		      nickname: profile.displayName,
				})
				.then(user => {
					//console.log("SUCCESS: " + user)
		      return done(null, user);// Need a null in order to successfully redirect. Wow! WHY?
		    })
		    .catch(err => {
		    	console.log("ERROR: "+  err)
		      //res.status(500).json({message: 'Internal server error'})
		    });	

		   database[accessToken] = {
        googleId: profile.id,
        accessToken: accessToken
    	}; 
    // User.findOrCreate({ username: profile.id }, {nickname: profile.displayName},
    // 	function (err, user) {
    //   return done(err, user);
    // });
  } 
));

// passport.use(new BearerStrategy(
//   function(token, done) {
//       if (!(token in database)) {
//           return done(null, false);
//       }
//       return done(null, database[token]);
//   }
// ));

// Go to login page from Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }));

// Callback from , but stuck here
router.get('/auth/google/callback',
  passport.authenticate('google',{failureRedirect: '/login', session: true}),
  function(req, res) {
    // Authenticated successfully
    // console.log("SUCCESS");
    // fs.readFile('./public/index.html', function(err, html) {
    //     html = html.toString();
    //     html = html.replace('<!--AUTHCODE-->', '<script>var AUTH_TOKEN="' + req.user.password + '"; history.replaceState(null, null, "/index.html");</script>');
    //     //res.send(html);
    // });
    res.redirect("/users/" + req.user.username+ "?access_token="+req.user.password);
    //res.redirect('/index.html'); // Question - Access Origin error! if I use redirect, what other method?
    //return res.status(201).json(req.body.user);
  });

// Bearer Strategy
// passport.use(new BearerStrategy(
//   function(token, done) {
//   		console.log("Token: "+ token);
//   		console.log("DB: " + database);
//       if (!(token in database)) {
//           return done(null, false);
//       }
//       return done(null, database[token]);
//   }
// ));
passport.use(
    new BearerStrategy(
        function(token, done) {
            User.findOne({ password: token },
                function(err, user) {
                    if(err) {
                        return done(err)
                    }
                    if(!user) {
                        return done(null, false)
                    }

                    return done(null, user, { scope: 'all' })
                }
            );
        }
    )
);

// passport.serializeUser(function(user, done) {
//   // done(null, user.id);
//   done(null, user);
// });

// passport.deserializeUser(function(obj, done) {
//   // Users.findById(obj, done);
//   done(null, obj);
// });


// const basicStrategy = new BasicStrategy((username, password, done) => {
// 	let user;
// 	User
// 		.findOne({username: username})
// 		.exec()
// 		.then(_user => {
// 			// console.log(password)
// 			user = _user;
// 			if (!user) {
// 				return done(null, false, {message: 'Invalid username'});
// 			}
// 			return user.validatePassword(password);

// 		})
// 		.then(isValid => {
// 			if (!isValid) {
// 				return done(null, false, {message: 'Invalid password'});
// 			} else {
// 				return done(null, user);
// 			}
// 		});
// });

// passport.use(basicStrategy); 
// router.use(passport.initialize());


// router.post('/', (req, res) => {
//   if (!req.body) {
//     return res.status(400).json({message: 'No request body'});
//   }

//   if (!('username' in req.body)) {
//     return res.status(422).json({message: 'Missing field: username'});
//   }

//   let {username, password, nickname} = req.body;

//   if (typeof username !== 'string') {
//     return res.status(422).json({message: 'Incorrect field type: username'});
//   }

//   username = username.trim();

//   if (username === '') {
//     return res.status(422).json({message: 'Incorrect field length: username'});
//   }

//   if (!(password)) {
//     return res.status(422).json({message: 'Missing field: password'});
//   }

//   if (typeof password !== 'string') {
//     return res.status(422).json({message: 'Incorrect field type: password'});
//   }

//   password = password.trim();

//   if (password === '') {
//     return res.status(422).json({message: 'Incorrect field length: password'});
//   }

//   return User
//     .find({username})
//     .count()
//     .exec()
//     .then(count => {
//       if (count > 0) {
//         return res.status(422).json({message: 'username already taken'});
//       }

//       return User.hashPassword(password)
//     })
//     .then(hash => {
// 	    return User
// 		  	.create({			
// 		  		username: username,
// 		      password: hash,
// 		      nickname: nickname,
// 		      portfolio: req.body.portfolio
// 				})
// 				.then(user => {
// 		      return res.status(201).json(user.apiRepr());
// 		    })
// 		    .catch(err => {
// 		    	console.log(err)
// 		      res.status(500).json({message: 'Internal server error'})
// 		    });	
//     });
// });

/*
By default, if authentication fails, Passport will respond with a 401 Unauthorized status, 
and any additional route handlers will not be invoked. 
If authentication succeeds, the next handler will be invoked 
and the req.user property will be set to the authenticated user.
*/
router.get('/:username', //compare password?
  passport.authenticate('bearer', {session: true}),
  function (req, res) { 
  	//res.json({user: req.user.apiRepr()}); 
  	res.redirect('/index.html');
  }
);

router.get('/:username/stock', passport.authenticate('bearer', {session: true}), (req, res) => {
	return User
		.findOne({username: req.user.username}) //
		.populate('portfolio.investedStocks.stockId.stock')   
		.exec(function(err, user) {
			res.status(200).json(user);
		});
});

router.post('/:username/stock', passport.authenticate('bearer', {session: true}), (req, res) => {
	console.log(req.body.symbol)
	Stock
		.create({
			symbol: req.body.symbol,
			price: 10,//req.body.price,
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
					console.log("SucCESS")
					res.status(201).end();
				})
				.catch(err => {
					console.log(err);
				})
		})
	}
);

router.put('/:username/stock/:symbol', passport.authenticate('bearer', {session: true}), (req, res) => {
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

router.put('/:username/stock/:symbol/:price', passport.authenticate('bearer', {session: true}), (req, res) => {
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