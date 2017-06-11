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
const {User} = require('./user');
const {Stock} = require('./stock');

router.use(jsonParser);
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());

// const BearerStrategy = require('passport-http-bearer').Strategy;


// // Bearer Strategy
// passport.use(new BearerStrategy(
//   function(token, done) {
//     User.findOne({ password: token }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       return done(null, user, { scope: 'all' });
//     });
//   }
// ));

const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;
  console.log("USER:", username);
  console.log("PW:", password);
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      console.log("_USER:" , user)
      // return user.validatePassword(password);
      if (password === user.password) {
      	return callback(null, user)
      } else {
      	return callback(null, false, {message: 'Incorrect password'});
      }
    })
    // .then(isValid => {
    // 	console.log("isValid: ", isValid);
    //   if (!isValid) {
    //     return callback(null, false, {message: 'Incorrect password'});
    //   }
    //   else {
    //     return callback(null, user)
    //   }
    // });
});

passport.use('mybasic', basicStrategy);

router.post('/login', (req, res) => {
  let {username, password} = req.body;

  username = username.trim();
  password = password.trim();

  return User
    .findOne({username}) // find will return an array
    .exec()
    .then(user => {
      if (user) { 	
      	if (user.password === req.body.password) {
      		return res.status(201).json({
      			username: user.username,
      			nickname: user.nickname,
      			portfolio: user.portfolio
      		});
      	} else {
      		return res.status(422).json({message: 'Wrong Password'});
      	}
      } else {
      	return res.status(422).json({message: 'Wrong Username'});
      }
    })
    .catch(err => {
    	console.log(err);
      res.status(500).json({message: 'Internal server error'})
    });	
});

router.get('/home/:user', function(req, res) {
	console.log("REQ", req.params.user);
	res.redirect('/home.html'); 
})

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/index.html'); 
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
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User
        .create({
          username: username,
          password: password,
          nickname: req.body.nickname,
        })
    })
    .then(user => {
    	// Lead you to the home page
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
    	console.log(err);
      res.status(500).json({message: 'Internal server error'})
    });	
})

module.exports = router;