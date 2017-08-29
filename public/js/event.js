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
    buyStock(symbol, totalQuantity);
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
      sellStock(symbol, totalQuantity);
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
}())