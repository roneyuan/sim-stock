function addStockPromise(searchTerm, quantity) {
  let getStockPrice = new Promise((resolve, reject) => {
    let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
    $.ajax({
      data: { 
        symbols: searchTerm,
        key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
      },
      url: url,
      dataType: "jsonp",
      success: function(data) {
        // Get the price from API
        if (data.results === null) reject("No results");

        let price = data.results[0].lastPrice;

        if (data.status.code !== 200 || data.results[0].lastPrice === null) {
          reject("Unable to find the symbol.");
        } else if (portfolio.checkIfEnoughMoney(price * quantity)) {
          reject("Not enough money!");
        } else {      
          resolve(data);
        }
      },
      error: function(error) {
        reject(error);
      }
    }); 
  });

  getStockPrice
    .then(data => {
        return new Promise((resolve, reject) => {
          $.ajax({
            url: 'users/username/stock?access_token='+access_token,
            method: 'POST',
            data: {
              symbol: searchTerm,
              quantity: quantity,
              price: data.results[0].lastPrice
            },
            dataType: "json"
          }).done(function(result) {
            resolve(result);
          }).fail(function(err) {
            reject(err);
          }); 
        });
    })
    .then(result => {
      updateAllStocks(result);
    })
    .catch(error => {
      $('.process-bg').hide();
      console.log("Error: " + error);
      handleError(error);
    })
}

/* Need to fix buying power*/
function updateAllStocks(result) {
  let promisesList = [];

  portfolio.initOrRefresh(result.portfolio);

  for (let i = 0; i < portfolio.stocks.length; i++) {
    promisesList.push(new Promise ((resolve, reject) => {
      let symbol = portfolio.stocks[i].symbol;
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
          portfolio.stocks
            .find(stock => stock.symbol === symbol)
            .currentPrice = data.results[0].lastPrice;

            resolve();
        },
        error: handleError
      }); 
    }));
  }

  Promise.all(promisesList)
    .then(() => {
      displayLatestStockUpdates(portfolio);          
    })
    .catch(error => {
      $('.process-bg').hide();
      console.log("Error: " + error);
      handleError(error);
    })  
}

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

function addStock(symbol, quantity) {
  // Check if it is already owned
  if (portfolio.checkIfOwned(symbol)) {
    alert(symbol + " already in your portfolio.");
  } else {
    // Call Promise
    addStockPromise(symbol, quantity);
  }
}

function buyStock() {
  /* TODO */
}

function sellStock() {
  /* TODO */
}

function displayLatestStockUpdates(state) {
  $('.list').remove();    
  $('.process-bg').hide();
  
  let marketOpen = new Date();
  let day = marketOpen.getDay();
  let hour = marketOpen.getHours();
  let inputTime;

  if (day == 6 || day == 0 || hour < 9 || hour > 16) {
    inputTime = '<input class="list-button-quantity" type="number" placeholder="Closed" disabled />';
  } else {
    inputTime = '<input class="list-button-quantity" type="number" placeholder="Quantity" />';
  }

  for (let i=state.stocks.length-1; i >= 0; i--) {
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

  $('#available-money').text("$"+state.buyingPower);
  $('#total-value').text("$"+state.totalValue);
  $('#earning').text("$"+state.earning);
  $('#earned').text("$"+state.earned);
  $('#invested').text("$"+state.invested);
}

function handleError(err) {
  console.log(err);
  $('.process-bg').hide();
  alert("Invalid. Please try again.");
}

$(function() {
  $.ajax({
    url: 'users/username/stock?access_token='+access_token,
    method: 'GET',
  }).done(function(result) {
    $('.process-bg').show();
    updateAllStocks(result);
  }).fail(function(err) {
    throw err;
  });
});



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
      // console.log("data", data.results[0]);
      let buyingPower = +($('#available-money').text().replace('$', ''));
      let price = data.results[0].lastPrice;
      let checkEnough = buyingPower - (price*quantity);
      if (data.status.code != 200) {
        alert("Unable to find the symbol.");
        $('.process-bg').hide();
      } else if (operate == "buy" && checkEnough < 0) {
        alert("Not enough money!");
        $('.process-bg').hide();
      } else {
        // price = data.results[0].lastPrice;

        $.ajax({
          url: 'users/104638216487363687391/stock/' + symbol + '/' + operate + '?access_token=' + access_token,
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





