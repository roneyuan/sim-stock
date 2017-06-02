/* Feature coming soon... */
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = express.Router();
const jsonParser = require('body-parser').json();

router.use(jsonParser);

router.get('/login', (req, res) => {
  res.redirect('/login.html')
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/index.html'); 
});


module.exports = router;