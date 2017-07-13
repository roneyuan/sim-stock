let getUser = (function(keyset) {
  let res = keyset.split('=', 2)[1];
  
  return res;
}(location.search.substr(1)));

let portfolio;
let user = getUser;

function getLatestStockUpdates() {
  $.ajax({
    url: '/account/'+user+'/stock',
    method: 'GET',
  }).done(function(result) { 
    updateCurrentPrice(result);  
  }).fail(function(err) {
    $('.process-bg').hide();
    throw err;
  });
}

function callBarchartOnDemandApi(searchTerm, quantity, access_token) {
  let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
  $.ajax({
    data: { 
      symbols: searchTerm,
      key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
    },
    url: url,
    dataType: "jsonp",
    success: function(data) {
      // console.log(data);
      let buyingPower = +($('#available-money').text().replace('$', ''));
      let price = data.results[0].lastPrice;
      let checkEnough = buyingPower - (price*quantity);      
      if (data.status.code != 200 || data.results[0].lastPrice == null) {
        $('.process-bg').hide();
        alert("Unable to find the symbol."); /* TODO Symbo Finder */
      } else if (checkEnough < 0) {
        $('.process-bg').hide();
        alert("Not enough money!")

      } else {
        // console.log(data)

        price = data.results[0].lastPrice;
                // console.log("Price", price)
        $.ajax({
          url: '/account/'+user+'/stock',
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
          $('.process-bg').hide();
          console.log("Update price error: " + err)
        }); 
      }
    },
    error: handleError
  }); 
}

function sellOrBuyStock(symbol, quantity, newPrice, operate) {
  let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
  $.ajax({
    data: { 
      symbols: symbol,
      key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
    },
    url: url,
    dataType: "jsonp",
    success: function(data) {
      let buyingPower = +($('#available-money').text().replace('$', ''));
      console.log("POWER",buyingPower)
      let price = data.results[0].lastPrice;
      let checkEnough = buyingPower - (price*quantity);

      if (data.status.code != 200) {
        $('.process-bg').hide();
        alert("Unable to find the symbol."); /* TODO Symbo Finder */
      } else if (operate=="buy" && checkEnough < 0) {
        $('.process-bg').hide();
        alert("Not enough money!")
      } else {
        price = data.results[0].lastPrice;

        $.ajax({
          url: '/account/'+user+'/stock/' + symbol + '/' + operate,
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
          $('.process-bg').hide();
          console.log("Sell or buy error: " + err)
        });          
      }
    },
    error: handleError
  }); 
}

function handleError(err) {
  console.log(err);
  $('.process-bg').hide();
  alert("Invalid. Please try again.");
}

function displayLatestStockUpdates(state) {
  $('.list').remove();    
  // console.log(state);
  $('.process-bg').hide();
  let marketOpen = new Date();
  let day = marketOpen.getDay();
  let hour = marketOpen.getHours();
  let inputTime;
  if (day == 6 || day == 0 || hour < 9 || hour > 16) {
    inputTime = '<input class="list-button-quantity" type="number" placeholder="Closed" disabled/>';
    // $("button").prop("disabled", true);
  } else {
    inputTime = '<input class="list-button-quantity" type="number" placeholder="Quantity" />';
  }

  for (let i=state.stocks.length-1; i >=0; i--) {
    $('.portfolio').append(`
      <div class="list">
        <div class="col-4 stock stockInfo">${state.stocks[i].symbol}</div>
        <div class="col-4 stockInfo">Quantity: <span class="quantity">${state.stocks[i].quantity}</span></div>
        <div class="col-4 stockInfo">Buy in: <span class="buyinPrice">${state.stocks[i].buyInPrice}</span></div>
        <div class="col-4 stockInfo">Current: <span class="currentPrice">${state.stocks[i].currentPrice}</span></div>
        <div class="list-button">
          <button id="buy-more" class="buy-more">More</button>
          <button class="sell">Sell</button>
          ${inputTime}
        </div>
      </div>`);
  }

  // $("button").prop("disabled", true);

  $('#available-money').text("$"+state.buyingPower);
  $('#total-value').text("$"+state.totalValue);
  $('#earned').text("$"+state.earned);
  $('#invested').text("$"+state.invested);
}

$('#addStock').on('click', function(event) {
  event.preventDefault();

  let symbol = $('#searchSymbol').val();
  let quantity = $('#enterQuantity').val();
  $('.process-bg').show();
  callBarchartOnDemandApi(symbol, +quantity);
  $('#searchSymbol').val("");
  $('#enterQuantity').val("");
});

$('.portfolio').on('click', '.buy-more',function(event) {
  event.preventDefault();

  let buyingQuantity = $(event.target).parent()[0]['lastElementChild']['value'];
  let symbol = $(event.target).parent().parent().find('.stock').text();
  let currentQuantity = $(event.target).parent().parent().find('.quantity').text();
  let totalQuantity = +buyingQuantity + +currentQuantity;
  if (buyingQuantity >= 0) {
    //buyStock(symbol)
    $(event.target).parent()[0]['lastElementChild']['value'] = "";
    $('.process-bg').show();
    sellOrBuyStock(symbol, totalQuantity, "", "buy")
  } else {
    alert("Please enter quantity");
  }
});

$('.portfolio').on('click', '.sell',function(event) {
  event.preventDefault();
  let sellingQuantity = $(event.target).parent()[0]['lastElementChild']['value'];
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
      $('.process-bg').show();
      sellOrBuyStock(symbol, totalQuantity, price, "sell");
    } else {
      alert("Please enter quantity");
    }       
  }
});

function clonePortfolio(stocks) {

  let slicedStocks = stocks.slice();

  let result = slicedStocks.map((stock) => 
    Object.assign({}, {
      _id: stock._id, 
      stockId: Object.assign({}, { 
        quantity: stock.stockId.quantity, 
        stock: Object.assign({}, stock.stockId.stock)
      })
    })
  );

  return result;
}

function updateCurrentPrice(result) {
  var initStocks = clonePortfolio(result.portfolio.investedStocks);

  for (let i=0; i<initStocks.length; i++) {
    let symbol = initStocks[i].stockId.stock.symbol;
    let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
    $.ajax({
      data: { 
        symbols: symbol,
        key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
      },
      url: url,
      dataType: "jsonp",
      success: function(data) {
        // Find and update the price that matches the symbol
        initStocks
          .find(stock => stock.stockId.stock.symbol == symbol)
          .stockId.stock.currentPrice = data.results[0].lastPrice;

        // Check if all current price are updated
        if (i == initStocks.length - 1) {
          portfolio = makePortfolio(false, initStocks, result.portfolio.earned);
          displayLatestStockUpdates(portfolio.getPortfolio());          
        }
      },
      error: handleError
    }); 
  }  
}

$(function() {
  $.ajax({
    url: '/account/'+user+'/stock',
    method: 'GET',
  }).done(function(result) {
    updateCurrentPrice(result);  
  }).fail(function(err) {
    throw err;
  });
})


/* Future optimization */
function sellStock(symbol, quantity) {
  // 1. Get the latest price
  // 2. Get the buy-in price
  // 3. Calculate the earning
  // 4. Update quantity and earned
  // 5. Update the state

  // 1. GET the buy-in Price
  $.ajax({
    url: '/account/'+user+'/stock/' + symbol,
    method: 'GET',
    dataType: "json"
  }).done(function(result) {
    var buyInPrice = result.price;
    // 2. GET the latest price
    let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
    $.ajax({
      data: { 
        symbols: symbol,
        key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
      },
      url: url,
      dataType: "jsonp",
      success: function(data) {
        if (data.status.code != 200) {
          alert("Unable to find the symbol. "); /* TODO Symbo Finder */
        } else {
          let currentPrice = data.results[0].lastPrice;  
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
/* End Here */