const state = {
	totalValue: 0,
	invested: 0,
	earned: 0,
	buyingPower: 0,
	stocks: []
};

function makeStock(spec) {

  for (let i=0; i<spec.length; i++) {
 		getLatestPrice({
  		symbol: spec[i].stockId.stock.symbol,
 			buyInPrice: spec[i].stockId.stock.price,
 			currentPrice: 0,
 			quantity: spec[i].stockId.quantity			
 		}, spec.length);
  }
};

function getLatestPrice(data, len) {
	var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";

  $.ajax({
    data: { symbol: data.symbol },
    url: MARKITONDEMAND_URL,
    dataType: "jsonp",
    success: function(price) {
    	$('body').trigger('updateCurrentPrice', [{
    		symbol: data.symbol, 
    		buyInPrice: data.buyInPrice, 
    		currentPrice: price.LastPrice, 
    		quantity: data.quantity
    	}, len]);
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
	//console.log("Earned: " + earned);
	state.earned = earned;
	return earned;

}

function calcInvested() {
	let len = state.stocks.length;
	let invested = 0;
	for (let i=0; i < len; i++) {
		invested += state.stocks[i].buyInPrice*state.stocks[i].quantity;
	}
	//console.log("Invested: " + invested);
	state.invested = invested;
	return invested;
}

function calcBuyingPower() {
	let invested = calcInvested();
	let buyingPower = 1000000 - invested;
	return buyingPower;
}

$('body').on('updateCurrentPrice', function(event, data, len) {
	state.stocks.push(data);

	if (state.stocks.length == len) {
		//console.log("finish");
		// continue...
		updateState();
		// Modify DOM
		//console.log(state);
		displayLatestStockUpdates(state)

	} 
})





