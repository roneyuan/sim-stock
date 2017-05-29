

// Need another constructor for updating single instead of put in makePortfolio
// Use initializing in the portfolio for get stock

function getNewPortfolio() {
		// var updateSingleStock = function() {
	// 	let access_token = qs["access_token"];
	//   $.ajax({
	//     url: 'users/104638216487363687391/stock?access_token='+access_token,
	//     method: 'GET',
	//   }).done(function(result) {
	//     updateSingle(result.portfolio.investedStocks);
	//   }).fail(function(err) {
	//     throw err;
	//   });	
	// };

	// function updateSingle(spec) {
	// 	for (let i=0; i<spec.length; i++) {
	//   	stocks.push({
	//   		symbol: spec[i].stockId.stock.symbol,
	//  			buyInPrice: spec[i].stockId.stock.price,
	//  			currentPrice: spec[i].stockId.stock.currentPrice,
	//  			quantity: spec[i].stockId.quantity			
	// 		});
	// 	}	
	// 	calcTotalValue();
	// };
}


function makePortfolio() {
	const _state = {
		totalValue: 0,
		invested: 0,
		earned: 0,
		buyingPower: 0,
		stocks: []
	};
	//const stocks = [];



	$(function() {
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
	}());

	function addStock(spec) {
	  for (let i=0; i<spec.length; i++) {
	  	_state.stocks.push({
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
		for (let i=0; i<_state.stocks.length; i++) {
			// If last one, that means it is finished
			updatePrice(_state.stocks[i].symbol);
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
	    	_state.stocks.find(stock => _state.stock.symbol == symbol).currentPrice = price.LastPrice;

	    	if (_state.stocks.find(stock => _state.stock.currentPrice == undefined) == undefined) {
					calcTotalValue();
	    	}
	    },
	    error: handleError
	  }); 
	};

	function calcTotalValue() {
		let defaultMoney = 1000000.00;
		let totalValue = defaultMoney + calcEarned();

		_state.totalValue = totalValue;
		_state.buyingPower = calcBuyingPower();

		//displayLatestStockUpdates();
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
		//let _stocks = stocks.slice(); //clone the stocks here
		// Clone the element using assign so that it will not affect _state when changes
		let state = _state.stocks.map(elem => Object.assign({}, elem));
		// return object using assign
		return state;
	}

	return Object.freeze({
		//getStock,
		//updateSingleStock

		// return all getallstock function

		// Need to clone the object in the stocks
		getAllstock
	});
}

// Using interface differently

// var obj = makeProtfe 
// pbj = return getall stock


function displayLatestStockUpdates(stocks) {
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
