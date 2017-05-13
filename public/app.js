var MOCK_DATA = {
	stocks: [{"_id":"58e5b781d51a5c34330e00d9","symbol":"KO","price":123,"__v":0,"quantity":20},
	{"_id":"58e6e489d181ae3517f9ffc4","symbol":"AAPL","price":100,"quantity": 20,"__v":0},
	{"_id":"58e6e6bd7d34d735288b7d84","symbol":"MSFT","price":100,"quantity":10,"__v":0},
	{"_id":"58e6e9f91b78dc352d1664aa","symbol":"UAA","price":100,"quantity":10,"__v":0}]
}


function getLatestStockUpdates(callbackFn) {
    let access_token = qs["access_token"];
    $.ajax({
        url: 'users/104638216487363687391/stock?access_token='+access_token,
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
	$('.list').remove();		
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

$('#addStock').on('click', function(event) {

	// Use jQuery to get the input value and use ajax to send the value to node
	// Then we can call the function after the callback is finsihed from back-end
	let symbol = $('#searchSymbol').val();
	let quantity = $('#enterQuantity').val();
    let access_token = qs["access_token"];
    $.ajax({
        url: 'users/104638216487363687391/stock?access_token='+access_token,
        method: 'POST',
        data: {
        	symbol: symbol,
        	quantity: quantity,
        	price: 50
        },
         dataType: "json"
    }).done(function(result) {
        getAndDisplayLatestStockUpdates();
    }).fail(function(err) {
        getAndDisplayLatestStockUpdates(); // WHY going here???
    });

  //setTimeout(() => getAndDisplayLatestStockUpdates(), 100);	// Any other best way???
});

var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

$(function() {
    getAndDisplayLatestStockUpdates();
})