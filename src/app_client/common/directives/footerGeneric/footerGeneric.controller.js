(function () {

	angular
	.module('nativeQDAApp')
	.controller('footerCtrl', footerCtrl);

	/* @ngInject */
	function footerCtrl($location, authentication, $uibModal, $scope) {
		var vm = this;

		// Bindable Functions

		// Bindable Data
		vm.currentPath = $location.path();
		
		
		///////////////////////////

	}
})();