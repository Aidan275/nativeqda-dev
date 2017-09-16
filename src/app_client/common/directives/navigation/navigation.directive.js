/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc directive 
* @restrict 'EA'
* @name directives.directive:navigation
* @description Directive to display the main navigation bar.
*/

(function () {
	angular
	.module('directives')
	.directive('navigation', navigation);

	function navigation() {
		return {
			restrict: 'EA',
			templateUrl: '/common/directives/navigation/navigation.template.html',
			controller: 'navigationCtrl as navvm'
		};
	}
})();