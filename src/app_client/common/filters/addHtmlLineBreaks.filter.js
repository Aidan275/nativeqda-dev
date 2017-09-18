/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc filter 
* @name filters.filter:addHtmlLineBreaks
* @description Filter for replacing new line characters (\n) with HTML line breaks.
*/

(function () {
	angular
	.module('filters')
	.filter('addHtmlLineBreaks', addHtmlLineBreaks);

	function addHtmlLineBreaks () {
		return function(text) {
			var output = text.replace(/\n/g, '<br/>');
			return output;
		};
	}
	
})();