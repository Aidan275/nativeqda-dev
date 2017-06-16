(function () {

	angular
	.module('nativeQDAApp')
	.controller('loginCtrl', loginCtrl);

	loginCtrl.$inject = ['$location', 'authentication', 'events', 'logger'];
	function loginCtrl($location, authentication, events, logger) {
		var vm = this;

		vm.onSubmit = onSubmit;
		vm.login = login;

		vm.credentials = {
			email : "",
			password : ""
		};

		vm.pageHeader = {
			title: 'Sign in to nativeQDA'
		};

		vm.returnPage = $location.search().page || '/';


		function onSubmit() {
			if (!vm.credentials.email || !vm.credentials.password) {
				logger.error("All fields required, please try again", 'Error', 'Error');
				return false;
			} else {
				login();
			}
		};

		function login() {
			events.event({email : vm.credentials.email, desc : "Login"});
			authentication
			.login(vm.credentials)
			.then(function(response) {
				$location.search('page', null);
				$location.path(vm.returnPage);
			});
		};

	}

})();