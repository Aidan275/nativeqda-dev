/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc filter 
* @name filters.filter:formatFileSize
* @description Filter for determining and adding the appropriate unit for file sizes
*/
(function () {

	angular
	.module('filters')
	.filter('formatFileSize', formatFileSize);

	function formatFileSize () {
		return function(bytes, precision) {
			if (bytes === 0 || isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
				return '';
			}

			if (typeof precision === 'undefined') {
				precision = 1;
			}

			var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));

			return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
		}
	}

})();