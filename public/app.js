// var MOCK_DATA = {
// 	stocks: [{"_id":"58e5b781d51a5c34330e00d9","symbol":"KO","price":123,"__v":0,"quantity":20},
// 	{"_id":"58e6e489d181ae3517f9ffc4","symbol":"AAPL","price":100,"quantity": 20,"__v":0},
// 	{"_id":"58e6e6bd7d34d735288b7d84","symbol":"MSFT","price":100,"quantity":10,"__v":0},
// 	{"_id":"58e6e9f91b78dc352d1664aa","symbol":"UAA","price":100,"quantity":10,"__v":0}]
// }

// var getStockPrice = 0;


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
            <div class="col-4">Quantity: <div class="quantity">${data[i].stockId.quantity}</div></div>
            <div class="col-4">Buy in: <div class="buyinPrice">${data[i].stockId.stock.price}</div></div>
            <div class="col-4">Current: <div class="currentPrice">${getStockPrice()}</div></div>
            <div class="list-button">
                <button id="buy-more" class="buy-more">More</button>
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
    event.preventDefault();
	// Use jQuery to get the input value and use ajax to send the value to node
	// Then we can call the function after the callback is finsihed from back-end
	let symbol = $('#searchSymbol').val();
	let quantity = $('#enterQuantity').val();
    let access_token = qs["access_token"];
    callMarkitOnDemandApi(symbol, quantity, access_token);
  //setTimeout(() => getAndDisplayLatestStockUpdates(), 100);	// Any other best way???
});

$('.portfolio').on('click', '.buy-more',function(event) {
    event.preventDefault();
    //console.log($(event.target).parent()[0]['lastElementChild']['value']);
    // console.log($(event.target).closest('.stock').text()); // Does not work?
    // Use State might be a better choice
    // Reviewing Model Pattern
    // Or using classless OOP pattern or class free pattern
    //console.log($(event.target).parent().parent().find('.stock').text());
    let buyingQuantity = $(event.target).parent()[0]['lastElementChild']['value']; // Easier way?
    let symbol = $(event.target).parent().parent().find('.stock').text();
    let currentQuantity = $(event.target).parent().parent().find('.quantity').text();
    let totalQuantity = +buyingQuantity + +currentQuantity;
    let price = 30;
    if (buyingQuantity >= 0) {
        sellOrBuyStock(symbol, totalQuantity, price)
    } else {
        alert("Please enter quantity");
    }
});

$('.portfolio').on('click', '.sell',function(event) {
    event.preventDefault();
    let sellingQuantity = $(event.target).parent()[0]['lastElementChild']['value']; // Easier way?
    let symbol = $(event.target).parent().parent().find('.stock').text();
    let currentQuantity = $(event.target).parent().parent().find('.quantity').text();
    if (+sellingQuantity > +currentQuantity) {
        alert("Invalid: Your are selling more than you have");
    } else {
        let price = 30;
        totalQuantity = +currentQuantity - +sellingQuantity;
        if (sellingQuantity >= 0) {
            sellOrBuyStock(symbol, totalQuantity, price)
        } else {
            alert("Please enter quantity");
        }       
    }


});


function sellOrBuyStock(symbol, quantity, price) {
    let access_token = qs["access_token"];
    $.ajax({
        url: 'users/104638216487363687391/stock/' + symbol + '?access_token=' + access_token,
        method: 'PUT',
        data: {
            symbol: symbol,
            quantity: quantity,
            price: price
        },
         dataType: "json"
    }).done(function(result) {
        getAndDisplayLatestStockUpdates()
    }).fail(function(err) {
        console.log("ERR: " + err)
    });

}

function callMarkitOnDemandApi(searchTerm, quantity, access_token) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; 

    $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: function(data) {
            if (data.Status !== "SUCCESS") {
                alert("Unable to find the symbol. Try Use Symbol Finder!"); /* TODO Symbo Finder */
            } else {
                 price = data.LastPrice;
                 $.ajax({
                    url: 'users/104638216487363687391/stock?access_token='+access_token,
                    method: 'POST',
                    data: {
                        symbol: searchTerm,
                        quantity: quantity,
                        price: price
                    },
                     dataType: "json"
                }).done(function(result) {
                    getAndDisplayLatestStockUpdates();
                }).fail(function(err) {
                    getAndDisplayLatestStockUpdates(); // WHY going here???
                });           
            }
        },
        error: handleError
    }); 
}


function displayStockData(data, quantity, access_token) {
    if (data.Status !== "SUCCESS") {
        alert("Unable to find the symbol. Try Use Symbol Finder!"); /* TODO Symbo Finder */
    } else {
         price = data.LastPrice;
         $.ajax({
            url: 'users/104638216487363687391/stock?access_token='+access_token,
            method: 'POST',
            data: {
                symbol: symbol,
                quantity: quantity,
                price: price
            },
             dataType: "json"
        }).done(function(result) {
            getAndDisplayLatestStockUpdates();
        }).fail(function(err) {
            getAndDisplayLatestStockUpdates(); // WHY going here???
        });           
    }

    // return stockPrice;
}

function getCurrentStockPrice(searchTerm) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; 
    var currentStockPrice;
    return $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: function(data) {
            if (data.Status !== "SUCCESS") {
                alert("Unable to find the symbol. Try Use Symbol Finder!");  //TODO Symbo Finder 
            } else {
                currentStockPrice = data.LastPrice;
                return currentStockPrice;
            }

        },
        error: handleError
    }); 


    //return currentStockPrice;
}

function handleError(err) {
    console.log(err);
}



/* Need to update */
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