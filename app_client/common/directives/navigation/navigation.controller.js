(function () {

	angular
	.module('nativeQDAApp')
	.controller('navigationCtrl', navigationCtrl);

	navigationCtrl.$inject = ['$location', 'authentication', 'events'];
	function navigationCtrl($location, authentication, events) {
		var vm = this;

		// Bindable Functions
		vm.logout = logout;

		// Bindable Data
		vm.currentPath = $location.path();
		vm.isLoggedIn = authentication.isLoggedIn();
		vm.currentUser = authentication.currentUser();


		///////////////////////////

		// Stores the user's email, current page, and time in the database for analytics
		events.event({email : authentication.currentUser().email});

		function logout() {
			authentication.logout({
				email : authentication.currentUser().email,
				desc : "Logout"
			});
			$location.path('/login');
		};

	}
})();