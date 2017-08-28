function makePortfolio(init, spec, earned) {
	var _stocks = spec;

	const _state = {
		totalValue: 0,
		invested: 0,
		earned: earned.toFixed(2),
		earning: 0,
		buyingPower: 0,
		stocks: [],
	};

	if (init === false) {
		addStock(_stocks)
	} 

	function addStock(spec) {
		spec.forEach(stock => _state.stocks.push({
  		symbol: stock.stockId.stock.symbol,
 			buyInPrice: stock.stockId.stock.price,
 			currentPrice: stock.stockId.stock.currentPrice,
 			quantity: stock.stockId.quantity	
		}));

		calcTotalValue();
	};

	function calcTotalValue() {
		let defaultMoney = 1000000.00;
		let totalValue = defaultMoney + calcEarning();

		_state.totalValue = totalValue+ (+_state.earned);
		_state.buyingPower = calcBuyingPower();
	}

	function calcEarning() {
		let len = _state.stocks.length;
		let invest = calcInvested();
		let currentTotal = 0;

		for (let i = 0; i < len; i += 1) {
			currentTotal += _state.stocks[i].currentPrice*_state.stocks[i].quantity;
		}

		let earning = currentTotal - invest;
		_state.earning = +earning.toFixed(2);

		return +earning.toFixed(2);

	}

	function calcInvested() {
		let len = _state.stocks.length;
		let invested = 0;

		for (let i = 0; i < len; i += 1) {
			invested += _state.stocks[i].buyInPrice*_state.stocks[i].quantity;
		}

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

// (function(){
// 	let marketOpen = new Date();
// 	let day = marketOpen.getDay();
// 	let hour = marketOpen.getHours();

// 	if (day == 6 || day == 0 || hour < 9 || hour > 16) {
// 		$('input').prop('readonly', true);
// 		$("button").prop("disabled", true);
// 		alert("Warning! Current market is closed. You cannot buy and sell the stock. ")
// 	} 

// 	// Hide processing icon;
// 	$('.process-bg').hide();
// }())