function getLatestPriceFromAPI(searchTerm, quantity) {
  return new Promise((resolve, reject) => {
    let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
    $.ajax({
      data: { 
        symbols: searchTerm,
        key: "2fa1f157fb3ce032ffbb1d9fc16b687g"
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
}

/* Need to fix buying power*/
function updateAllStocks() {
  let promisesList = [];

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
      portfolio.calcEarningAndTotal();
      displayLatestStockUpdates(portfolio);          
    })
    .catch(error => {
      $('.process-bg').hide();
      console.log("Error: " + error);
      handleError(error);
    })  
}

function addStock(symbol, quantity) {
  // Check if it is already owned
  if (portfolio.checkIfOwned(symbol)) {
    alert(symbol + " already in your portfolio.");
    $('.process-bg').hide();
  } else {
    // Call Promise
    getLatestPriceFromAPI(symbol, quantity)
      .then(data => {
          return new Promise((resolve, reject) => {
            $.ajax({
              url: 'users/username/stock?access_token='+access_token,
              method: 'POST',
              data: {
                symbol: symbol,
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
        portfolio.addStock({
          symbol: symbol,
          quantity: quantity,
          price: result.price,
          currentPrice: result.price       
        });

        displayLatestStockUpdates(portfolio);
      })
      .catch(error => {
        $('.process-bg').hide();
        console.log("Error: " + error);
        handleError(error);
      })    
  }
}

function buyOrSellStock(symbol, quantity, operate) {
  getLatestPriceFromAPI(symbol, quantity)
    .then(data => {
      return new Promise((resolve, reject) =>{
        $.ajax({
          url: 'users/104638216487363687391/stock/' + symbol + '/' + operate + '?access_token=' + access_token,
          method: 'PUT',
          data: {
            symbol: symbol,
            quantity: quantity,
            price: data.results[0].lastPrice
          },
          dataType: "json"
        }).done(function(result) {
          resolve(result);
        }).fail(function(err) {
          $('.process-bg').hide();
          reject(err);
        });        
      })
    })
    .then(result => {
      // Update portfolio
      let findStock = portfolio.stocks.find(stock => stock.symbol === result.symbol);

      findStock.quantity = quantity;
      findStock.buyInPrice = result.price;
      
      portfolio.refresh(result.earned);
      displayLatestStockUpdates(portfolio);
    })
}

function displayLatestStockUpdates(state) {
  $('.list').remove();    
  $('.process-bg').hide();
  
  let marketOpen = new Date();
  let day = marketOpen.getDay();
  let hour = marketOpen.getHours();
  let inputTime;

  if (day == 6 || day == 0 || hour < 9 || hour > 16) {
    inputTime = `
      <button id="buy-more" class="buy-more" disabled>More</button>
      <button class="sell" disabled>Sell</button>
      <input class="list-button-quantity" type="number" placeholder="Closed" disabled />`;

  } else {
    inputTime = `
      <button id="buy-more" class="buy-more">More</button>
      <button class="sell">Sell</button>
      <input class="list-button-quantity" type="number" placeholder="Quantity" />`;
  }

  for (let i=state.stocks.length-1; i >= 0; i--) {
    $('.portfolio').append(`
      <div class="list">
        <div class="col-4 stock stockInfo">${state.stocks[i].symbol}</div>
        <div class="col-4 stockInfo">Quantity: <span class="quantity">${state.stocks[i].quantity}</span></div>
        <div class="col-4 stockInfo">Buy in: <span class="buyinPrice">${state.stocks[i].buyInPrice}</span></div>
        <div class="col-4 stockInfo">Current: <span class="currentPrice">${state.stocks[i].currentPrice}</span></div>
        <div class="list-button">
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
    portfolio.init(result.portfolio);
    updateAllStocks();
  }).fail(function(err) {
    throw err;
  });
});