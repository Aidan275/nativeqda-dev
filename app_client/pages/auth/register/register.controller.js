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
			name : "",
			email : "",
			password : ""
		};
		vm.pageHeader = {
			title: 'Create a new NativeQDA account'
		};
		vm.returnPage = $location.search().page || '/';

		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.name || !vm.credentials.email || !vm.credentials.password) {
				logger.error("All fields required, please try again", '', 'Error');
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