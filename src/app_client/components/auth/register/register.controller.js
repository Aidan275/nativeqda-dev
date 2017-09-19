/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name auth.controller:registerCtrl
* @description Controller for the register page.
*/

(function () {

	angular
	.module('auth')
	.controller('registerCtrl', registerCtrl);

	registerCtrl.$inject = ['$location','authService', 'logger'];
	function registerCtrl($location, authService, logger) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.register = register;

		// Bindable Data
		vm.credentials = {
			password : "",
			email : "",
			firstName : "",
			lastName : "",
			company : ""
		};
		vm.pageHeader = {
			title: 'Create a new NativeQDA account'
		};
		vm.returnPage = $location.search().page || '/';

		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.password || !vm.credentials.email || !vm.credentials.firstName || !vm.credentials.lastName) {
				logger.error("Missing fields required, please try again", '', 'Error');
				return false;
			} else {
				register();
			}
		};

		function register() {
			authService
			.register(vm.credentials)
			.then(function(){
				$location.search('page', null); 
				$location.path(vm.returnPage);
			});
		};

	}

})();