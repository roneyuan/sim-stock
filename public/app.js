function getLatestStockUpdates() {
  $.ajax({
    url: 'users/104638216487363687391/stock?access_token='+access_token,
    method: 'GET',
  }).done(function(result) {
    let portfolio = makePortfolio(false, result.portfolio.investedStocks).getPortfolio();
    displayLatestStockUpdates(portfolio);   
  }).fail(function(err) {
    throw err;
  });
}

function callMarkitOnDemandApi(searchTerm, quantity, access_token) {
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
          getLatestStockUpdates();
        }).fail(function(err) {
          console.log("Update price error: " + err)
        });           
      }
    },
    error: handleError
  }); 
}

function sellOrBuyStock(symbol, quantity) {
    $.ajax({
      data: { symbol: symbol },
      url: MARKITONDEMAND_URL,
      dataType: "jsonp",
      success: function(data) {
        if (data.Status !== "SUCCESS") {
          alert("Unable to find the symbol. Try Use Symbol Finder!"); /* TODO Symbo Finder */
        } else {
          price = data.LastPrice;

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
            getLatestStockUpdates();
          }).fail(function(err) {
            console.log("Sell or buy error: " + err)
          });          
        }
      },
      error: handleError
    }); 
}

/* Future optimization */
function sellStock(symbol, quantity) {
  // 1. Get the latest price
  // 2. Get the buy-in price
  // 3. Calculate the earning
  // 4. Update quantity and earned
  // 5. Update the state

  // 1. GET the buy-in Price
  $.ajax({
    url: 'users/104638216487363687391/stock/' + symbol + '?access_token=' + access_token,
    method: 'GET',
    dataType: "json"
  }).done(function(result) {
    var buyInPrice = result.price;
    // 2. GET the latest price
    $.ajax({
      data: { symbol: symbol },
      url: MARKITONDEMAND_URL,
      dataType: "jsonp",
      success: function(data) {
        if (data.Status !== "SUCCESS") {
          alert("Unable to find the symbol. Symbol Finder coming soon!"); /* TODO Symbo Finder */
        } else {
          let currentPrice = data.LastPrice;   
          let earning = (currentPrice - buyInPrice)*quantity     
          // 3. Update quantity and earned
        }
      },
      error: handleError
    });     

  }).fail(function(err) {
    console.log("Sell or buy error: " + err)
  });  

}

function buyMoreStock(symbol, quantity) {
  // 1. Get the buy-price
  // 2. Get the latest price
  // 3. Calculate the average
  // 4. Update the price
  // 5. Update the quantity
}

function handleError(err) {
  console.log(err);
  alert("This is free version. You have reach API call limit. Please try again later.");
}

function displayLatestStockUpdates(state) {
  $('.list').remove();    
  console.log(state);
  for (let i=0; i<state.stocks.length; i++) {
    $('.portfolio').append(`
      <div class="list">
        <div class="col-4 stock stockInfo">${state.stocks[i].symbol}</div>
        <div class="col-4 stockInfo">Quantity: <span class="quantity">${state.stocks[i].quantity}</span></div>
        <div class="col-4 stockInfo">Buy in: <span class="buyinPrice">${state.stocks[i].buyInPrice}</span></div>
        <div class="col-4 stockInfo">Current: <span class="currentPrice">${state.stocks[i].currentPrice}</span></div>
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

var getToken = (function(keyset) {
  var res = keyset.split('=', 2)[1];
  return res;
}(location.search.substr(1)));


$('#addStock').on('click', function(event) {
  event.preventDefault();

  let symbol = $('#searchSymbol').val();
  let quantity = $('#enterQuantity').val();
  callMarkitOnDemandApi(symbol, +quantity, access_token);
  $('#searchSymbol').val("");
  $('#enterQuantity').val("");
});

$('.portfolio').on('click', '.buy-more',function(event) {
  event.preventDefault();

  let buyingQuantity = $(event.target).parent()[0]['lastElementChild']['value']; // Easier way?
  let symbol = $(event.target).parent().parent().find('.stock').text();
  let currentQuantity = $(event.target).parent().parent().find('.quantity').text();
  let totalQuantity = +buyingQuantity + +currentQuantity;
  //let price = 30; // Get the latest price 
  if (buyingQuantity >= 0) {
    //buyStock(symbol)
    $(event.target).parent()[0]['lastElementChild']['value'] = "";
    sellOrBuyStock(symbol, totalQuantity)
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
      //sellStock(symbol);
      $(event.target).parent()[0]['lastElementChild']['value'] = "";
      sellOrBuyStock(symbol, totalQuantity, price);
    } else {
      alert("Please enter quantity");
    }       
  }
});

$(function() {
  $.ajax({
    url: 'users/104638216487363687391/stock?access_token='+access_token,
    method: 'GET',
  }).done(function(result) {
      var initStocks = makePortfolio(true).getAllstock();
      initStocks = result.portfolio.investedStocks.map(elem => Object.assign({}, elem));
 
      for (let i=0; i<initStocks.length; i++) {
        let symbol = initStocks[i].stockId.stock.symbol;
        $.ajax({
          data: { symbol: symbol },
          url: MARKITONDEMAND_URL,
          dataType: "jsonp",
          success: function(price) {
            // Find and update the price that matches the symbol
            initStocks
              .find(stock => stock.stockId.stock.symbol == symbol)
              .stockId.stock.currentPrice = price.LastPrice;

            // Check if all current price are updated
            if (i == initStocks.length - 1) {
              let portfolio = makePortfolio(false, initStocks).getPortfolio();
              displayLatestStockUpdates(portfolio);          
            }
          },
          error: handleError
        }); 
      }
  }).fail(function(err) {
    throw err;
  });
})

var access_token = getToken;
var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";