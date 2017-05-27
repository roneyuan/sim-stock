function makePortfolio() {
	const stocks = [];
	var toggle = false;

	// addStock call the Ajax function
	function getStock() {
		// $.ajax here
		// .done will call add stock
		// return a function that access the state for frozen object - the rule cannot break
		/// push into the new stock

		// stocks.push({
  // 		symbol: symbol,
 	// 		buyInPrice: undefined,
 	// 		currentPrice: undefined,
 	// 		quantity: undefined
		// });

		// 1. Call the ajax
		let access_token = qs["access_token"];
	  $.ajax({
	    url: 'users/104638216487363687391/stock?access_token='+access_token,
	    method: 'GET',
	  }).done(function(result) {
	    addStock(result.portfolio.investedStocks);
	  }).fail(function(err) {
	    throw err;
	  });
	}

	function addStock(spec) {
	  for (let i=0; i<spec.length; i++) {
	  	state.push({
	  		symbol: spec[i].stockId.stock.symbol,
	 			buyInPrice: spec[i].stockId.stock.price,
	 			currentPrice: undefined,
	 			quantity: spec[i].stockId.quantity			
			});
		 }
	 }

	function updateStock() {
		// check if stock has undefined
		for (let i=0; i<stocks.length; i++) {
			// If last one, that means it is finished
			if (i === stocks.length - 1) {
				toggle = true;
			}
			updatePrice(stocks[i].symbol);
		}
	}
}

	function updatePrice(symbol) {
		var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";
		$.ajax({
	    data: { symbol: symbol },
	    url: MARKITONDEMAND_URL,
	    dataType: "jsonp",
	    success: function(price) {
	    	// Update price and if it is finished, go to another function
	    	stocks.find(stocks => return stock.symbol == symbol).currentPrice = price;

	    	if (toggle === true) {
	    		toggle = false;
					calcTotalValue();
	    	}
	    },
	    error: handleError
	  }); 
	}

	function calcTotalValue() {
		let defaultMoney = 1000000;
		let totalValue = defaultMoney + calcEarned();

		state.totalValue = totalValue;
	}

	function calcEarned() {
		let len = state.stocks.length;
		let invest = calcInvested();
		let currentTotal = 0;
		for (let i=0; i < len; i++) {
			currentTotal += state.stocks[i].currentPrice*state.stocks[i].quantity;
		}

		let earned = currentTotal - invest;
		state.earned = earned;
	}

	function calcInvested() {
		let len = state.stocks.length;
		let invested = 0;
		for (let i=0; i < len; i++) {
			invested += state.stocks[i].buyInPrice*state.stocks[i].quantity;
		}

		state.invested = invested;
	}

	return Object.freeze({
		getStock
	});
}