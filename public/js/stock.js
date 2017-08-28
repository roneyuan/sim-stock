class Stock {
  constructor(symbol, buyInPrice, currentPrice, quantity) {
    this.symbol = symbol;
    this.buyInPrice = buyInPrice;
    this.currentPrice = currentPrice;
    this.quantity = quantity;
  }

  buy(quantity, price) {
    this.quantity += quantity;
    this.buyInPrice = price;
  }

  sell(quantity) {
    this.quantity -= quantity;
  }

  checkValidQuantity(quantity) {
    if (quantity > this.quantity) {
      return false;
    } else {
      return true;
    }
  }
}