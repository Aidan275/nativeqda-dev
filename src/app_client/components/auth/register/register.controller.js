(function () {

	angular
	.module('nativeQDAApp')
	.controller('registerCtrl', registerCtrl);

	registerCtrl.$inject = ['$location','authentication', 'logger'];
	function registerCtrl($location, authentication, logger) {
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
			authentication
			.register(vm.credentials)
			.then(function(){
				$location.search('page', null); 
				$location.path(vm.returnPage);
			});
		};

	}

})();