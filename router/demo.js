/* Feature coming soon... */
const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const fs = require('fs');
const {User} = require('../models/user');
const {Stock} = require('../models/stock');

router.use(jsonParser);
router.use(passport.initialize());
router.use(passport.session());

const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const localStrategy = new LocalStrategy(
  function(username, password, callback) {

  username = username.trim();
  password = password.trim();

  let user;
  
  return User
    .findOne({username}) // find will return an array
    .exec()
    .then(_user => {
      user = _user;
      console.log("CHECK POINT 1");
      return User.hashPassword(password);
    })
    .then(hash => {
      console.log("CHECK POINT 2")
      if (!user) { return callback(null, false); }
      
      user.validatePassword(password, function(err, isValid) {
        if (err) {
          return callback(null, false);
        }

        if (!isValid) {
          return callback(null, false);
        }

        console.log("Validate Password SUCCESS")
        return callback(null, user);
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'})
    }); 
});

// Future integration
// OpenID with autherization

passport.use('mylocal', localStrategy);

passport.serializeUser(function(user, cb) {
  console.log("CHECK POINT 3")
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  console.log("CHECK POINT 4")
  Users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

router.post('/login', passport.authenticate('mylocal', 
  { 
    failWithError: true
  }), 
  function(req, res, next) {
    console.log("LOGIN SUCCESS");
    res.status(201).json({url:'/account/home/'+req.body.username});
  },
  function(err, req, res, next) {
    // handle error
    // if (req.xhr) { return res.json(err); }
    res.status(422).json({message: 'Invalid Username or Password'});
  });

router.get('/login', (req, res) => {
  res.redirect('/index.html');
})

router.get('/home/:user', function(req, res) {
  console.log("CHECK POINT 5");
  res.redirect('/custom/home.html?user=' + req.params.user); 
});


/***
Get stock list
***/
router.get('/:username/stock', (req, res) => {
  // console.log("REQ STOCK:", req.user); 
  return User
    .findOne({username: req.params.username}) //
    .populate('portfolio.investedStocks.stockId.stock')   
    .exec(function(err, user) {
      res.status(200).json(user);
    });
});


/***
Buy new stock
***/
router.post('/:username/stock', (req, res) => {
  Stock
    .create({
      symbol: req.body.symbol,
      price: req.body.price,
      currentPrice: req.body.price,
      quantity: req.body.quantity 
    })
    .then(stock => {
      console.log("STOCK", stock)
      return User
        .findOneAndUpdate({username:req.params.username}, 
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
          res.status(201).json({
            symbol: stock.symbol,
            price: stock.price
          });
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
router.put('/:username/stock/:symbol', (req, res) => {
  if (req.params.symbol !== req.body.symbol) {
    return res.status(400).send("Request field does not match");
  }

  return User
    .findOne({username: req.params.username})
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




router.get('/:username/stock/:symbol', (req, res) => {
  //console.log("REQ1:" + req.params.symbol) // req.body,symbol does not work? Why? Maybe because it is using GET
  return User
    .findOne({username: req.params.username})
    .populate('portfolio.investedStocks.stockId.stock')
    .exec((err, user) => {
      let stocks = user.portfolio.investedStocks;
      let findStock;
      for (let i=0; i<stocks.length; i++) {
        if (stocks[i].stockId.stock.symbol === req.params.symbol) {
          findStock = user.portfolio.investedStocks[i].stockId.stock["_id"];
        }       
      }
      console.log("Find Stock: " + findStock)
      return Stock
        .findById(findStock)
        .exec()
        .then(stock => {
          //console.log(stock);
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

/***
Buy update
***/
router.put('/:username/stock/:symbol/buy', (req, res) => {
  
  if (req.params.symbol !== req.body.symbol) {
    return res.status(400).send("Request field does not match");
  }
  let currentQuantity;
  return User
    .findOne({username: req.params.username})
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
          console.log("BODY", req.body.price)
          console.log("New Price", newPrice);
          stock.price = newPrice.toFixed(2);
          stock.save((err) => {
            if (err) {
              console.log("Stock save errror: ", err)
            }
          });
          res.status(201).json({
            symbol: stock.symbol,
            price: stock.price,
            currentPrice: stock.currentPrice,
            earned: null
          });
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
router.put('/:username/stock/:symbol/sell', (req, res) => {

  if (req.params.symbol !== req.body.symbol) {
    return res.status(400).send("Request field does not match");
  }

  return User
    .findOne({username: req.params.username})
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

          // console.log("Current Quantity", currentQuantity);
          // console.log("Stock Price", stock.price);
          // console.log("Request quantity", req.body.quantity);
          // console.log("Price now", req.body.price);

          let earned = (req.body.price - stock.price) * (currentQuantity - req.body.quantity);
        
          user.portfolio.earned += earned;

          user.save((err) => {
            if (err) {
              console.log("User save errror: ", err)
            }
          });
          res.status(201).json({
            symbol: stock.symbol,
            price: stock.price,
            currentPrice: stock.currentPrice,
            earned: user.portfolio.earned
          });
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
Update current price for stock TODO - Need a new path otherwise it will conflict with buy and sell
***/
router.put('/:username/stock/:symbol/:price', (req, res) => {
  if (req.params.price !== req.body.price || req.params.symbol !== req.body.symbol) {
      return res.status(400).send("Request field does not match");  
  }

  return User
    .findOne({username: req.params.username})
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

router.post('/signup', function(req, res) {
  // Sign up function
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password, firstName, lastName} = req.body;

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

  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'Username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      // console.log(hash);
      return User
        .create({
          username: username,
          password: hash,
          nickname: req.body.nickname,
        })
    })
    .then(user => {
      res.status(201).json({url: '/account/home/'+user.username});
    })
    .catch(err => {
      // console.log(err);
      res.status(500).json({message: 'Internal server error'})
    }); 
})

module.exports = router;