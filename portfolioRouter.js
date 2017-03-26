const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Portfolio} = require('./models');


router.get('/', (req, res) => {
	res.json(ShoppingList.get());
});

router.post('/', jsonParser, (req, res) => {

});

router.delete('/:id', (req, res) => {

});

router.put('/:id', jsonParser, (req, res) => {

});

module.exports = router;