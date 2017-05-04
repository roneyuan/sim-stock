var MOCK_DATA = {
	stocks: [{"_id":"58e5b781d51a5c34330e00d9","symbol":"KO","price":123,"__v":0,"quantity":20},
	{"_id":"58e6e489d181ae3517f9ffc4","symbol":"AAPL","price":100,"quantity": 20,"__v":0},
	{"_id":"58e6e6bd7d34d735288b7d84","symbol":"MSFT","price":100,"quantity":10,"__v":0},
	{"_id":"58e6e9f91b78dc352d1664aa","symbol":"UAA","price":100,"quantity":10,"__v":0}]
}

function getLatestStockUpdates(callbackFn) {

    $.ajax({
        url: 'users/test30/stock/',
        method: 'GET',
    }).done(function(result) {
        callbackFn(result.portfolio.investedStocks);
    }).fail(function(err) {
        throw err;
    });

    //setTimeout(function(){ callbackFn(MOCK_DATA)}, 100);
}

// this function stays the same when we connect
// to real API later
function displayLatestStockUpdates(data) {
    for (let i=0; i<data.length; i++) {
       $('.portfolio').append(`
       		<div class="list">
						<div class="col-4 stock">${data[i].stockId.stock.symbol}</div>
						<div class="col-4 quantity">Quantity: ${data[i].stockId.quantity}</div>
						<div class="col-4 buyinPrice">Buy in: ${data[i].stockId.stock.price}</div>
						<div class="col-4 currentPrice">Current: ${data[i].stockId.stock.price}</div>
						<div class="list-button">
							<button class="buy-more">More</button>
							<button class="sell">Sell</button>
							<input class="list-button-quantity" type="number" />
						</div>
					</div>`);
    }
}

// this function can stay the same even when we
// are connecting to real API 
function getAndDisplayLatestStockUpdates() {
    getLatestStockUpdates(displayLatestStockUpdates);
}

$(function() {
    getAndDisplayLatestStockUpdates();
})