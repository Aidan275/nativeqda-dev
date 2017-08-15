(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('resetPasswordCtrl', resetPasswordCtrl);

	/* @ngInject */
	function resetPasswordCtrl(authentication, logger, $routeParams, $location, $timeout) {
		var vm = this;

		var token = $routeParams.token;

		/* Bindable Functions */
		vm.onSubmit = onSubmit;

		/* Bindable Data */
		vm.pageHeader = {
			title: 'Reset Password'
		};

		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.password || !vm.credentials.confirmPassword) {
				logger.error('All fields required, please try again', '', 'Error')
				return false;
			} else {
				resetPassword();
			}
		};

		function resetPassword() {
			authentication.resetPassword({token: token, password: vm.credentials.password})
			.then(function(response) {
				logger.success('Your new password has been saved. Redirecting to the login page in 3 seconds.', '', 'Success')
				$timeout(function() {
					$location.path('/login');
				}, 3000);
			})
		}

	}

})();