let getUser = (function(keyset) {
  let res = keyset.split('=', 2)[1];
  
  return res;
}(location.search.substr(1)));

let user = getUser;

class Stock {
  constructor(symbol, buyInPrice, currentPrice, quantity) {
    this.symbol = symbol;
    this.buyInPrice = buyInPrice;
    this.currentPrice = currentPrice;
    this.quantity = quantity;
  }
}

class Portfolio {
  constructor() {
    this.totalValue = 1000000.00;
    this.invested = 0;
    this.earned = 0;
    this.earning = 0;
    this.buyingPower = 1000000.00;
    this.stocks = [];
    this.currentOwnedStocks = [];
    this.pastOwnedStocks = [];
  }

  init(stocks) {
    let currentInvested = 0;

    stocks.investedStocks.forEach(stock => {
      let stockObject = new Stock(stock.stockId.stock.symbol, stock.stockId.stock.price, stock.stockId.stock.currentPrice, stock.stockId.quantity); // WORK HERE ADD stock

      this.stocks.push(stockObject);

      if (stock.stockId.quantity === 0) {
        this.pastOwnedStocks.push(stockObject);
      } else {
        this.currentOwnedStocks.push(stockObject);
      }

      currentInvested += stock.stockId.stock.price * stock.stockId.quantity;
    });

    this.invested = Number(currentInvested.toFixed(2));
    this.earned = Number((stocks.earned).toFixed(2));
    this.buyingPower = Number((1000000.00 - this.invested).toFixed(2));    
  }

  refresh(earned) {
    let currentTotal = 0;
    let currentInvested = 0;

    this.stocks.forEach(stock => {
      currentTotal += stock.currentPrice * stock.quantity;
      currentInvested += stock.buyInPrice * stock.quantity;
    });

    currentTotal = Number(currentTotal.toFixed(2));
    
    this.invested = Number(currentInvested.toFixed(2));

    if (earned !== null) {
      this.earned = Number(earned.toFixed(2));      
    }

    this.buyingPower = Number((1000000.00 - this.invested).toFixed(2));  
    this.earning = Number((currentTotal - this.invested).toFixed(2));
    this.totalValue = Number((1000000.00 + this.earning + this.earned).toFixed(2)); 
  }    

  calcEarningAndTotal() {
    let currentTotal = 0;

    this.stocks.forEach(stock => {
      currentTotal += stock.currentPrice * stock.quantity;
    });

    currentTotal = Number(currentTotal.toFixed(2));

    this.earning = Number((currentTotal - this.invested).toFixed(2));
    this.totalValue = Number((1000000.00 + this.earning + this.earned).toFixed(2)); 
  }

  addStock(stock) {
    let stockObject = new Stock(stock.symbol, stock.price, stock.currentPrice, stock.quantity); // WORK HERE ADD stock
    this.currentOwnedStocks.push(stockObject);
    this.stocks.push(stockObject);

    this.invested += stock.price * stock.quantity;
    this.buyingPower = Number((1000000.00 - this.invested).toFixed(2));  
  }

  checkIfSellAll(stock) {
    if (stock.quantity === 0) {
      let index = currentOwnedStocks.findIndex(owned => owned.symbol === stock.symbol);
      this.currentOwnedStocks.splice(index, 1);
      this.pastOwnedStocks.push(stock);
    }
  }

  checkIfOwned(symbol) {
    let owned = false;

    this.stocks.forEach(stock => {
      if (stock.symbol === symbol) {
        owned = true;
      }
    });

    return owned;
  }

  checkIfEnoughMoney(money) {
    if (money > this.buyingPower) {
      return true;
    } else {
      return false;
    }
  }
}


let portfolio = new Portfolio();

$('#addStock').on('click', function(event) {
  event.preventDefault();

  let symbol = $('#searchSymbol').val().toUpperCase();
  let quantity = Number($('#enterQuantity').val());
  $('.process-bg').show();

  addStock(symbol, quantity);
  
  $('#searchSymbol').val("");
  $('#enterQuantity').val("");
});

$('.portfolio').on('click', '.buy-more', function(event) {
  event.preventDefault();

  let buyingQuantity = Number($(event.target).parent()[0]['lastElementChild']['value']);
  let currentQuantity = Number($(event.target).parent().parent().find('.quantity').text());
  let totalQuantity = buyingQuantity + currentQuantity;
  let symbol = $(event.target).parent().parent().find('.stock').text();

  if (buyingQuantity >= 0) {
    $(event.target).parent()[0]['lastElementChild']['value'] = "";
    $('.process-bg').show();

    buyOrSellStock(symbol, totalQuantity, "buy");
  } else {
    alert("Please enter quantity");
  }
});

$('.portfolio').on('click', '.sell', function(event) {
  event.preventDefault();

  let sellingQuantity = Number($(event.target).parent()[0]['lastElementChild']['value']);
  let currentQuantity = Number($(event.target).parent().parent().find('.quantity').text());
  let totalQuantity = 0;
  let symbol = $(event.target).parent().parent().find('.stock').text();

  if (sellingQuantity > currentQuantity) {
    alert("Invalid: Your are selling more than you have");
  } else {
    if (sellingQuantity >= 0) {
      totalQuantity = currentQuantity - sellingQuantity;

      $(event.target).parent()[0]['lastElementChild']['value'] = "";
      $('.process-bg').show();

      buyOrSellStock(symbol, totalQuantity, "sell");
    } else {
      alert("Please enter quantity");
    }       
  }
});

(function(){
  let marketOpen = new Date();
  let day = marketOpen.getDay();
  let hour = marketOpen.getHours();

  if (day == 6 || day == 0 || hour < 9 || hour > 16) {
    $('input').prop('readonly', true);
    $("button").prop("disabled", true);
    alert("Warning! Current market is closed. You cannot buy and sell the stock. ")
  } 

  // Hide processing icon;
  $('.process-bg').hide();
}());


function getLatestPriceFromAPI(searchTerm, quantity) {
  return new Promise((resolve, reject) => {
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
              url: '/account/'+user+'/stock',
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
          url: '/account/'+user+'/stock/' + symbol + '/' + operate,
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
    url: '/account/'+user+'/stock',
    method: 'GET',
  }).done(function(result) {
    $('.process-bg').show();
    portfolio.init(result.portfolio);
    updateAllStocks();
  }).fail(function(err) {
    throw err;
  });
});
