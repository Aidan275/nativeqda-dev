(function () {

	angular
	.module('nativeQDAApp')
	.controller('loginCtrl', loginCtrl);

	loginCtrl.$inject = ['$location', 'geolocation', 'authentication'];
	function loginCtrl($location, geolocation, authentication) {
		var vm = this;
		var lat;
		var lng;

		vm.getData = function (position) {
			lat = position.coords.latitude;
			lng = position.coords.longitude;
		};

		vm.showError = function (error) {
			$scope.$apply(function() {
				vm.message = error.message;
				console.log(vm.message);
			});
		};

		vm.noGeo = function () {
			$scope.$apply(function() {
				vm.message = "Geolocation is not supported by this browser.";
				console.log(vm.message);
			});
		};

		geolocation.getPosition(vm.getData,vm.showError,vm.noGeo);

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
			var userDetails = {
				email : vm.credentials.email,
				lat : lat,
				lng : lng
			};
			authentication.loginEvent(userDetails)
			.then(function(response){
				console.log("response");
			}, function(err){
console.log("response err");
			});
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