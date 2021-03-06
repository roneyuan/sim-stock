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

