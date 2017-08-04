(function () {

	angular
	.module('nativeQDAApp')
	.filter('capitalise', capitalise);

	// Filter to capitalise the first letter of a string
	function capitalise () {
		return function(input) {
			return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
		}
	}

})();