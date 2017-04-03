const {BasicStrategy} = require('passport-http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User, Portfolio} = require('./models');

router.use(jsonParser);

const basicStrategy = new BasicStrategy((username, password, callback) => {
	let user;
	User
		.findOne({username: username})
		.exec()
		.then(_user => {
			// console.log(password)
			user = _user;
			if (!user) {
				return callback(null, false, {message: 'Invalid username'});
			}
			return user.validatePassword(password);

		})
		.then(isValid => {
			if (!isValid) {
				return callback(null, false, {message: 'Invalid password'});
			} else {
				return callback(null, user);
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

  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
    	// console.log(username);
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash,
          nickname: nickname
        })
    })
    .then(user => {
    	console.log(user);
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error HERE'})
    });
});

// never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});



router.get('/me',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.json({user: req.user.apiRepr()})
);

router.get('/me/portfolio', (req, res) => {
	return Portfolio
		.find({}) // Question 3 How do we display current Id user?
		.populate('portfolio')
		.exec(function(err, user) {
			console.log(user)
		})
		.then(portfolio => res.json(portfolio))

		// Question 1. How do we display only for current user?
		// Question 2. How do we display with password needed?
})

router.put('/portfolio/:id', jsonParser, (req, res) => {
	if (req.params.id !== req.body.id) {
		return res.status(400);
	}

	const updatedItem = User.update({
		id: req.params.id,
		invested: req.body.invested,
		earned: req.body.earned
	});

	res.json(updatedItem);
})


module.exports = router;