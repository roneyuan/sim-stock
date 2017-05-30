// Need another constructor for updating single instead of put in makePortfolio
// Use initializing in the portfolio for get stock
function makePortfolio(init, spec) {
	var _stocks = spec;

	const _state = {
		totalValue: 0,
		invested: 0,
		earned: 0,
		buyingPower: 0,
		stocks: []
	};

	// let access_token = qs["access_token"];

	// $.ajax({
 //    url: 'users/104638216487363687391/stock?access_token='+access_token,
 //    method: 'GET',
 //  }).done(function(result) {
 //  	if (init === true) {
	// 		addStock(result.portfolio.investedStocks);
 //  	} else {
	// 		updateSingle(result.portfolio.investedStocks);
 //  	}
 //  }).fail(function(err) {
 //    throw err;
 //  });

	 if (init === true) {
	 //	$(addStock(_portfolio));
	 	//_state.stocks = _stocks;
	 	calcTotalValue();
	 } else {
	 	//$(updateSingle(_portfolio))
addStock(_stocks)
	 }


	function updateSingle(spec) {
		for (let i=0; i<spec.length; i++) {
	  	_state.stocks.push({
	  		symbol: spec[i].stockId.stock.symbol,
	 			buyInPrice: spec[i].stockId.stock.price,
	 			currentPrice: spec[i].stockId.stock.currentPrice,
	 			quantity: spec[i].stockId.quantity			
			});
		}	
		calcTotalValue();
	};

	function addStock(spec) {
		//calcTotalValue();
	  for (let i=0; i<spec.length; i++) {
	  	_state.stocks.push({
	  		symbol: spec[i].stockId.stock.symbol,
	 			buyInPrice: spec[i].stockId.stock.price,
	 			currentPrice: spec[i].stockId.stock.currentPrice,
	 			quantity: spec[i].stockId.quantity			
			});
		}
		//updateStock();
		calcTotalValue();
	};

	// function updateStock() {
	// 	for (let i=0; i<_state.stocks.length; i++) {
	// 		// If last one, that means it is finished
	// 		updatePrice(_state.stocks[i].symbol);
	// 	}
	// }

	// function updatePrice(symbol) {
	// 	var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";
	// 	$.ajax({
	//     data: { symbol: symbol },
	//     url: MARKITONDEMAND_URL,
	//     dataType: "jsonp",
	//     success: function(price) {
	//     	// Update price and if it is finished, go to another function
	//     	_state.stocks.find(stock => stock.symbol == symbol).currentPrice = price.LastPrice;

	//     	if (_state.stocks.find(stock => stock.currentPrice == undefined) == undefined) {
	// 				calcTotalValue();
	//     	}
	//     },
	//     error: handleError
	//   }); 
	// };

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
		for (let i=0; i < len; i++) {
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
		for (let i=0; i < len; i++) {
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
		// let stocks = _state.stocks.map(elem => Object.assign({}, elem));
		let portfolio = Object.assign({}, _state);
		return portfolio;
	}

	return Object.freeze({
		getAllstock
	});

}