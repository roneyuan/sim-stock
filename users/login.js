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

router.use(passport.initialize());

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID:  '603515610903-ov1hu4kjoghb028raqlmb2ndd4761re1.apps.googleusercontent.com',
    clientSecret: "K5NBv_fDAp6YcyZJQfNofxVb",
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ username: profile.id }, {nickname: profile.displayName},
    	function (err, user) {
      return done(err, user);
    });
  }
));

// Go to login page from Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }));

// Callback from Google
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Authenticated successfully
    //res.redirect('/');
    return res.status(201).json(user.apiRepr());
  });





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


router.post('/addUser', (req, res) => {
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

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/'); 
});


module.exports = {router};