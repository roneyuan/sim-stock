function getLatestStockUpdates() {
  let access_token = qs["access_token"];
  $.ajax({
    url: 'users/104638216487363687391/stock?access_token='+access_token,
    method: 'GET',
  }).done(function(result) {
    makeStock(result.portfolio.investedStocks);
  }).fail(function(err) {
    throw err;
  });
}

function displayLatestStockUpdates(data) {
  $('.list').remove();    
  console.log(data);
  for (let i=0; i<data.stocks.length; i++) {
    $('.portfolio').append(`
      <div class="list">
        <div class="col-4 stock">${data.stocks[i].symbol}</div>
        <div class="col-4">Quantity: <div class="quantity">${data.stocks[i].quantity}</div></div>
        <div class="col-4">Buy in: <div class="buyinPrice">${data.stocks[i].buyInPrice}</div></div>
        <div class="col-4">Current: <div class="currentPrice">${data.stocks[i].currentPrice}</div></div>
        <div class="list-button">
          <button id="buy-more" class="buy-more">More</button>
          <button class="sell">Sell</button>
          <input class="list-button-quantity" type="number" />
        </div>
      </div>`);
  }

  $('#available-money').text("$"+data.buyingPower);
  $('#total-value').text("$"+data.totalValue);
  $('#earned').text("$"+data.earned);
  $('#invested').text("$"+data.invested);
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
          getLatestStockUpdates();
        }).fail(function(err) {
          console.log("Update price error: " + err)
        });           
      }
    },
    error: handleError
  }); 
}

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
    getLatestStockUpdates();
  }).fail(function(err) {
    console.log("Sell or buy error: " + err)
  });
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


$('#addStock').on('click', function(event) {
  event.preventDefault();

  let symbol = $('#searchSymbol').val();
  let quantity = $('#enterQuantity').val();
  let access_token = qs["access_token"];
  callMarkitOnDemandApi(symbol, +quantity, access_token);
});

$('.portfolio').on('click', '.buy-more',function(event) {
  event.preventDefault();

  let buyingQuantity = $(event.target).parent()[0]['lastElementChild']['value']; // Easier way?
  let symbol = $(event.target).parent().parent().find('.stock').text();
  let currentQuantity = $(event.target).parent().parent().find('.quantity').text();
  let totalQuantity = +buyingQuantity + +currentQuantity;
  let price = 30; // Get update price 
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

$(function() {
  getLatestStockUpdates();
})