(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('loginCtrl', loginCtrl);

	/* @ngInject */
	function loginCtrl($location, authentication, logger, usersService) {
		var vm = this;

		//vm.pageClass = 'login-page';	/* Class added to the inner div in the index page (for styling) */
		vm.pageId = 'login-page-css';

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.login = login;
		vm.getAvatar = getAvatar;

		// Bindable Data
		vm.credentials = {
			email : "",
			password : ""
		};
		vm.pageHeader = {
			title: 'Sign in to nativeQDA'
		};
		vm.returnPage = $location.search().page || '/';
		vm.avatarUrl = 'assets/img/settings/default-avatar.png';

		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.email || !vm.credentials.password) {
				logger.error("All fields required, please try again", 'Error', 'Error');
				return false;
			} else {
				login();
			}
		};

		function login() {
			authentication
			.login(vm.credentials)
			.then(function(response) {
				$location.search('page', null);
				$location.path(vm.returnPage);
			});
		};

		function getAvatar() {
			if(vm.credentials.email) {
				usersService.getAvatar(vm.credentials.email)
				.then(function(response) {
					if(response.data) {
						vm.avatarUrl = response.data.avatar;
					} else {
						vm.avatarUrl = 'assets/img/settings/default-avatar.png';
					}
				});
			} else {
				vm.avatarUrl = 'assets/img/settings/default-avatar.png';
			}
		}

	}

})();