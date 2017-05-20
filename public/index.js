// Create an array with object
// const state = {
// 	totalValue: 0,
// 	invested: 0,
// 	earned: 0
// }

// const stock = {
// 	symbol: "",
// 	buyInPrice: 0,
// 	currentPrice: 0,
// 	quantity: 0
// }

//var stocksList = [];

function makeUserState(spec) {
	const state = {
		totalValue: 0,
		invested: 0,
		earned: 0,
		stocks: []
	};

	function updateState(itemsToUpdate) {
		// 
	};

	function makeStock(spec) {
		const stock = {
			symbol: "",
			buyInPrice: 0,
			currentPrice: 0,
			quantity: 0
		}

		function updateStock(itemsToUpdate) {

		}

		function addStock(spec) {

		};

		function deleteStock(spec) {

		};	

		return Object.freeze({stock});
	};

	function addStock(spec) {

	};

	function deleteStock(spec) {

	};	


	return Object.freeze({});	

}



