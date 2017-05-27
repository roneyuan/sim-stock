function makePortfolio() {
	const state = {
		totalValue: 0,
		invested: 0,
		earned: 0,
		buyingPower: 0,
		stocks: []
	};
	const stocks = [];
	var toggle = false;

	var getStock = function() {
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
	};

	function addStock(spec) {
	  for (let i=0; i<spec.length; i++) {
	  	stocks.push({
	  		symbol: spec[i].stockId.stock.symbol,
	 			buyInPrice: spec[i].stockId.stock.price,
	 			currentPrice: undefined,
	 			quantity: spec[i].stockId.quantity			
			});
		}
		updateStock();
	};

	function updateStock() {
		// check if stock has undefined
		for (let i=0; i<stocks.length; i++) {
			// If last one, that means it is finished
			updatePrice(stocks[i].symbol);
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
	    	stocks.find(stock => stock.symbol == symbol).currentPrice = price.LastPrice;

	    	if (stocks.find(stock => stock.currentPrice == undefined) == undefined) {
					calcTotalValue();
	    	}
	    },
	    error: handleError
	  }); 
	};

	function calcTotalValue() {
		let defaultMoney = 1000000;
		let totalValue = defaultMoney + calcEarned();

		state.totalValue = totalValue;

		displayLatestStockUpdates();
	};

	function calcEarned() {
		let len = stocks.length;
		let invest = calcInvested();
		let currentTotal = 0;
		for (let i=0; i < len; i++) {
			currentTotal += stocks[i].currentPrice*stocks[i].quantity;
		}

		let earned = currentTotal - invest;
		state.earned = earned;
		return earned
	};

	function calcInvested() {
		let len = stocks.length;
		let invested = 0;
		for (let i=0; i < len; i++) {
			invested += stocks[i].buyInPrice*stocks[i].quantity;
		}

		state.invested = invested;
		return invested
	};

	function displayLatestStockUpdates() {
	  $('.list').remove();    
	  console.log(stocks);
	  for (let i=0; i<stocks.length; i++) {
	    $('.portfolio').append(`
	      <div class="list">
	        <div class="col-4 stock stockInfo">${stocks[i].symbol}</div>
	        <div class="col-4 stockInfo">Quantity: <span class="quantity">${stocks[i].quantity}</span></div>
	        <div class="col-4 stockInfo">Buy in: <span class="buyinPrice">${stocks[i].buyInPrice}</span></div>
	        <div class="col-4 stockInfo">Current: <span class="currentPrice">${stocks[i].currentPrice}</span></div>
	        <div class="list-button">
	          <button id="buy-more" class="buy-more">More</button>
	          <button class="sell">Sell</button>
	          <input class="list-button-quantity" type="number" />
	        </div>
	      </div>`);
	  }

	  $('#available-money').text("$"+state.buyingPower);
	  $('#total-value').text("$"+state.totalValue);
	  $('#earned').text("$"+state.earned);
	  $('#invested').text("$"+state.invested);
	}

	return Object.freeze({
		getStock,
		//updateStock,
		//displayLatestStockUpdates
	});
}
