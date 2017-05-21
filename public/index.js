const state = {
	totalValue: 0,
	invested: 0,
	earned: 0,
	buyingPower: 0,
	stocks: []
};

function makeStock(spec) {

  for (let i=0; i<spec.length; i++) {
 		// state.stocks.push({
 		// 	symbol: spec[i].stockId.stock.symbol,
 		// 	buyInPrice: spec[i].stockId.stock.price,
 		// 	currentPrice: 0,
 		// 	quantity: spec[i].stockId.quantity
 		// });
 		getLatestPrice({
  		symbol: spec[i].stockId.stock.symbol,
 			buyInPrice: spec[i].stockId.stock.price,
 			currentPrice: 0,
 			quantity: spec[i].stockId.quantity			
 		});
  }

  //state.stocks = portfolio;
  //console.log(state);

  //updateState();

  //console.log(state);

  //getLatestPrice("UAA");
	//return function addStock(spec) {
		// stock.symbol = spec.symbol;
		// stock.buyInPrice = spec.buyInPrice;
		// stock.currentPrice = spec.currentPrice;
		// stock.quantity = spec.quantity;	
		// state.stocks.push(stock);		
	//};
};

function getLatestPrice(data) {
	// Using Ajax to get the price and return that price
	var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";

  $.ajax({
    data: { symbol: data.symbol },
    url: MARKITONDEMAND_URL,
    dataType: "jsonp",
    success: function(price) {
    	$('body').trigger('updateCurrentPrice', {
    		symbol: data.symbol, 
    		buyInPrice: data.buyInPrice, 
    		currentPrice: price.LastPrice, 
    		quantity: data.quantity
    	});
    },
    error: handleError
  }); 


}

function updateState() {
	state.totalValue = calcTotalValue();
	state.invested = calcInvested();
	state.earned = calcEarned(); 
	state.buyingPower = calcBuyingPower();
};

function calcTotalValue() {
	let defaultMoney = 1000000;
	let totalValue = defaultMoney + calcEarned();

	state.totalValue = totalValue;
	return totalValue;
}

function calcEarned() {
	let len = state.stocks.length;
	let invest = calcInvested();
	let currentTotal = 0;
	for (let i=0; i < len; i++) {
		currentTotal += state.stocks[i].currentPrice*state.stocks[i].quantity;
	}

	let earned = currentTotal - invest;
	console.log("Earned: " + earned);
	state.earned = earned;
	return earned;

}

function calcInvested() {
	let len = state.stocks.length;
	let invested = 0;
	for (let i=0; i < len; i++) {
		invested += state.stocks[i].buyInPrice*state.stocks[i].quantity;
	}
	console.log("Invested: " + invested);
	state.invested = invested;
	return invested;
}

function calcBuyingPower() {
	let invested = calcInvested();
	let buyingPower = 1000000 - invested;
	return buyingPower;
}

$('body').on('updateCurrentPrice', function(event, data) {
	// find stock in the state and update
	state.stocks.push(data);

	console.log(state);
})





// function makeUserState(spec) {
	
// 	function makeStock(spec) {
// 		const stock = {
// 			symbol: "",
// 			buyInPrice: 0,
// 			currentPrice: 0,
// 			quantity: 0
// 		}

// 		// function updateStock(itemsToUpdate) {

// 		// }

// 		function addStock(spec) {
// 			stock.symbol = spec.symbol;
// 			stock.buyInPrice = spec.price;
// 			stock.currentPrice = spec.currentPrice;
// 			stock.quantity = spec.quantity;	
// 			state.stocks.push(stock);		
// 		};

// 		function deleteStock(spec) {

// 		};	

// 		return Object.freeze({
// 			//updateStock,
// 			addStock,
// 			deleteStock
// 		});
// 	};

// 	function updateState(itemsToUpdate) {
// 		state.totalValue = calcTotalValue();
// 		state.invested = calcInvested();
// 		state.earned = calcEarned(); 
// 	};

// 	function calcTotalValue(spec) {
// 		let defaultMoney = 1000000;
// 		let totalValue = defaultMoney - calcInvested() + earned();

// 		return totalValue;
// 	}

// 	function calcEarned(sepc) {
// 		let len = state.stocks.length();
// 		let invest = calcInvested();
// 		let currentTotal = 0;
// 		for (let i=0; i < len; i++) {
// 			currentTotal += state.stocks[i].currentPrice;
// 		}

// 		let earned = currentTotal - invest;

// 		return earned;

// 	}

// 	function calcInvested() {
// 		let len = state.stocks.length();
// 		let invest = 0;
// 		for (let i=0; i < len; i++) {
// 			invested += state.stocks[i].buyInPrice;
// 		}

// 		return invested;
// 	}

// 	return Object.freeze({
// 		//state,
// 		makeStock,
// 		updateState,
// 		calcTotalValue,
// 		calcEarned,
// 		calcInvested
// 	});	
// }





