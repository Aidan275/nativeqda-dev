/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc filter 
* @name filters.filter:capitalise
* @description Filter to capitalise the first letter of a string
*/

(function () {

	angular
	.module('filters')
	.filter('capitalise', capitalise);

	function capitalise () {
		return function(input) {
			return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
		}
	}

})();