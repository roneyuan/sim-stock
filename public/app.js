var MOCK_DATA = {
	stocks: [{"_id":"58e5b781d51a5c34330e00d9","symbol":"KO","price":123,"__v":0,"quantity":20},
	{"_id":"58e6e489d181ae3517f9ffc4","symbol":"AAPL","price":100,"quantity": 20,"__v":0},
	{"_id":"58e6e6bd7d34d735288b7d84","symbol":"MSFT","price":100,"quantity":10,"__v":0},
	{"_id":"58e6e9f91b78dc352d1664aa","symbol":"UAA","price":100,"quantity":10,"__v":0}]
}

function getLatestStockUpdates(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_DATA)}, 100);
}

// this function stays the same when we connect
// to real API later
function displayLatestStockUpdates(data) {
    for (let i=0; i<data.stocks.length; i++) {
       $('.portfolio').append(`
       		<div class="list">
						<div class="stock">${data.stocks[i].symbol}</div>
						<button class="buy-more">more</button>
						<button class="sell">sell</button>
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