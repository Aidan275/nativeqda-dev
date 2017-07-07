(function () {

	angular
	.module('nativeQDAApp')
	.controller('navigationCtrl', navigationCtrl);

	/* @ngInject */
	function navigationCtrl($location, authentication, events, $uibModal) {
		var vm = this;

		// Bindable Functions
		vm.logout = logout;
		vm.popupEditProfile = popupEditProfile;

		// Bindable Data
		vm.currentPath = $location.path();
		vm.isLoggedIn = authentication.isLoggedIn();
		vm.currentUser = authentication.currentUser();

		///////////////////////////

		// Stores the user's email, current page, and time in the database for analytics
		events.event({email : authentication.currentUser().email});

		function popupEditProfile() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/settings/editProfile/editProfile.view.html',
				controller: 'editProfileCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function() {});
		}

		function logout() {
			authentication.logout({
				email : authentication.currentUser().email,
				desc : "Logout"
			});
			$location.path('/login');
		};

	}
})();