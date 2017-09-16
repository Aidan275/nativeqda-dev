/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc directive 
* @restrict 'EA'
* @name directives.directive:pageHeader
* @description Directive to display a page header.
*/

(function () {
	angular
	.module('directives')
	.directive('pageHeader', pageHeader);
	
	function pageHeader () {
		return {
			restrict: 'EA',
			scope: {
				content : '=content'
			},
			templateUrl: '/common/directives/pageHeader/pageHeader.template.html'
		};
	}
})();