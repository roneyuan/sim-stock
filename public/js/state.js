// Need another constructor for updating single instead of put in makePortfolio
// Use initializing in the portfolio for get stock
function makePortfolio(init, spec) {
	var _stocks = spec;

	const _state = {
		totalValue: 0,
		invested: 0,
		earned: 0,
		buyingPower: 0,
		stocks: [],
	};

	if (init === true) {
		//calcTotalValue();
	} else {
		addStock(_stocks)
	}

	function addStock(spec) {
	  for (let i=0; i<spec.length; i += 1) { // TODO - Use forEach
	  	_state.stocks.push({
	  		symbol: spec[i].stockId.stock.symbol,
	 			buyInPrice: spec[i].stockId.stock.price,
	 			currentPrice: spec[i].stockId.stock.currentPrice,
	 			quantity: spec[i].stockId.quantity			
			});
		}

		calcTotalValue();
	};

	function calcTotalValue() {
		let defaultMoney = 1000000.00;
		let totalValue = defaultMoney + calcEarned();

		_state.totalValue = totalValue;
		_state.buyingPower = calcBuyingPower();
	}

	function calcEarned() {
		let len = _state.stocks.length;
		let invest = calcInvested();
		let currentTotal = 0;
		for (let i=0; i < len; i += 1) { // TODO - User forEach  - Use +=1 better positioning 
			currentTotal += _state.stocks[i].currentPrice*_state.stocks[i].quantity;
		}

		let earned = currentTotal - invest;
		//console.log("Earned: " + earned);
		_state.earned = +earned.toFixed(2);
		return +earned.toFixed(2);

	}

	function calcInvested() {
		let len = _state.stocks.length;
		let invested = 0;
		for (let i=0; i < len; i++) { // Use forEach
			invested += _state.stocks[i].buyInPrice*_state.stocks[i].quantity;
		}
		//console.log("Invested: " + invested);
		_state.invested = +invested.toFixed(2);
		return +invested.toFixed(2);
	}

	function calcBuyingPower() {
		let invested = calcInvested();
		let buyingPower = 1000000 - invested;
		return +buyingPower.toFixed(2);
	}

	var getAllstock = function() {
		// Clone the element using assign so that it will not affect _state when changes
		let stocks = _state.stocks.map(elem => Object.assign({}, elem));
		return stocks;
	}

	var getPortfolio = function() {
		let portfolio = Object.assign({}, _state);
		return portfolio;
	}

	return Object.freeze({
		getAllstock,
		getPortfolio
	});

}