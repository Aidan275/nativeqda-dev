(function () {

	angular
	.module('nativeQDAApp')
	.controller('loginCtrl', loginCtrl);

	loginCtrl.$inject = ['$location', 'geolocation', 'authentication', 'events'];
	function loginCtrl($location, geolocation, authentication, events) {
		var vm = this;
	
		vm.credentials = {
			email : "",
			password : ""
		};

		vm.pageHeader = {
			title: 'Sign in to nativeQDA'
		};

		vm.returnPage = $location.search().page || '/';

		vm.onSubmit = function () {
			vm.formError = "";
			if (!vm.credentials.email || !vm.credentials.password) {
				vm.formError = "All fields required, please try again";
				return false;
			} else {
				vm.doLogin();
			}
		};

		vm.doLogin = function() {
			vm.formError = "";
			events.event({email : vm.credentials.email, desc : "Login"});
			authentication
			.login(vm.credentials)
			.then(function(response) {
				$location.search('page', null);
				$location.path(vm.returnPage);
			}, function(err){
				vm.formError = err.data.message;
			});
		};

	}

})();