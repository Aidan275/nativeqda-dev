/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc directive 
* @restrict 'EA'
* @name directives.directive:footerGeneric
* @description Directive to display a footer.
*/

(function () {
	angular
	.module('directives')
	.directive('footerGeneric', footerGeneric);
	
	function footerGeneric() {
		return {
			restrict: 'EA',
			templateUrl: '/common/directives/footerGeneric/footerGeneric.template.html'
		};
	}
})();