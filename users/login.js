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
const LocalStrategy = require('passport-local').Strategy;
router.use(jsonParser);
router.use(passport.initialize());

// const BearerStrategy = require('passport-http-bearer').Strategy;
// app.use(require('cookie-parser')());
// app.use(require('body-parser').urlencoded({ extended: true }));
// app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
// router.use(passport.initialize());
router.use(passport.session());

// Bearer Strategy
// passport.use('newbearer', new BearerStrategy(
//   function(token, done) {
//   	console.log(token);
//   	// console.log("DONE", done)
//     User.findOne({ password: token }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       return done(null, user, { scope: 'all' });
//     });
//   }));

// const basicStrategy = new BasicStrategy(function(username, password, callback) {
//   let user;
//   console.log("USER:", username);
//   console.log("PW:", password);
//   User
//     .findOne({username: username})
//     .exec()
//     .then(_user => {
//       user = _user;
//       if (!user) {
//         return callback(null, false, {message: 'Incorrect username'});
//       }
//       console.log("_USER:" , user)
//       // return user.validatePassword(password);
//       if (password === user.password) {
//       	return callback(null, user)
//       } else {
//       	return callback(null, false, {message: 'Incorrect password'});
//       }
//     })
//     // .then(isValid => {
//     // 	console.log("isValid: ", isValid);
//     //   if (!isValid) {
//     //     return callback(null, false, {message: 'Incorrect password'});
//     //   }
//     //   else {
//     //     return callback(null, user)
//     //   }
//     // });
// });

// passport.use('mybasic', basicStrategy);

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
    	// Everytime is different?
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

    		console.log("SUCCESS")
    		return callback(null, user);
    	})
    })
    .catch(err => {
    	console.log(err);
      res.status(500).json({message: 'Internal server error'})
    });	
	});

passport.use('mylocal', localStrategy);

// passport.use(new Strategy(
//   function(username, password, cb) {
//     db.users.findByUsername(username, function(err, user) {
//       if (err) { return cb(err); }
//       if (!user) { return cb(null, false); }
//       if (user.password != password) { return cb(null, false); }
//       return cb(null, user);
//     });
//   }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
	console.log("CHECK POINT 3", user)
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	console.log("CHECK POINT 4", id)
  Users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/home');
//   });
  
// app.get('/logout',
//   function(req, res){
//     req.logout();
//     res.redirect('/');
//   });

// app.get('/:user',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });




router.post('/login', passport.authenticate('mylocal', 
	{ 
		//successRedirect: '/account/home',
		failureRedirect: '/account/login' 
	}), function(req, res) {
	console.log("CHECK LOGIN", req.body);
	res.redirect('account/home');

});

router.get('/login', (req, res) => {
	res.redirect('/index.html')
})

// router.post('/login', (req, res) => {
//   let {username, password} = req.body;

//   username = username.trim();
//   password = password.trim();
//   let user;
//   return User
//     .findOne({username}) // find will return an array
//     .exec()
//     .then(_user => {
//     	user = _user;
//     	// Everytime is different?
//     	return User.hashPassword(password);
//     })
//     .then(hash => {
//     	if (user.validatePassword(password)) {
//     		return res.status(201).json({
//     			username: user.username,
//     			nickname: user.nickname,
//     			password: hash,
//     			portfolio: user.portfolio
//     		});    		
//     	}
//     })
//     .catch(err => {
//     	console.log(err);
//       res.status(500).json({message: 'Internal server error'})
//     });	
// });

router.get('/home', function(req, res) {
	console.log("CHECK POINT 5", req.params.user);
	console.log("Rerirect", req.session)
	res.redirect('/home.html'); 
});

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
      return User.hashPassword(password)
    })
  	.then(hash => {
  		console.log(hash);
    	return User
        .create({
          username: username,
          password: hash,
          nickname: req.body.nickname,
        })
  	})
    .catch(err => {
    	console.log(err);
      res.status(500).json({message: 'Internal server error'})
    });	
})

module.exports = router;