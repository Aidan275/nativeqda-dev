(function () {

	angular
	.module('nativeQDAApp')
	.controller('navigationCtrl', navigationCtrl);

	navigationCtrl.$inject = ['$location', 'authentication', 'events'];
	function navigationCtrl($location, authentication, events) {
		var vm = this;

		events.event({email : authentication.currentUser().email});

		vm.currentPath = $location.path();

		vm.isLoggedIn = authentication.isLoggedIn();

		vm.currentUser = authentication.currentUser();

		vm.logout = function() {
			authentication.logout({
				email : authentication.currentUser().email,
				desc : "Logout"
			});
			$location.path('/$logged-out');
		};

	}
})();