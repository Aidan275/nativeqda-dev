(function () {

	angular
	.module('nativeQDAApp')
	.controller('loginCtrl', loginCtrl);

	loginCtrl.$inject = ['$location','authentication'];
	function loginCtrl($location, authentication) {
		var vm = this;

		vm.pageHeader = {
			title: 'Sign in to nativeQDA'
		};

		vm.credentials = {
			email : "",
			password : ""
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