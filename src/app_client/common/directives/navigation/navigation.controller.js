/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller 
* @name directives.controller:navigationCtrl
* @description Controller for the {@link directives.directive:navigation navigation directive}.
*/

(function () {

	angular
	.module('directives')
	.controller('navigationCtrl', navigationCtrl);

	/* @ngInject */
	function navigationCtrl($location, authService, $uibModal, $scope) {
		var vm = this;

		// Bindable Functions
		vm.logout = logout;
		vm.popupEditProfile = popupEditProfile;

		// Bindable Data
		vm.currentPath = $location.path();
		vm.isLoggedIn = authService.isLoggedIn();
		vm.currentUser = authService.currentUser();
		var userEmail = vm.currentUser.email
		
		///////////////////////////

		function popupEditProfile(userEmail) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/settings/editProfile/editProfile.view.html',
				controller: 'editProfileCtrl as vm',
				size: 'xl',
				resolve: {
					userEmail: function () {
						return userEmail;
					}
				}
			});

			modalInstance.result.then(function() {
				vm.currentUser = authService.currentUser();
			});
		}

		function logout() {
			authService.logout({
				email : userEmail,
				desc : "Logout"
			});
			$location.path('/login');
		};

	}
})();