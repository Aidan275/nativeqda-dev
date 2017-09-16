/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc controller
* @name auth.controller:resetPasswordCtrl
* @description Controller for the reset password page.
*
* A link to the reset password page, including the corresponding token, is sent to the user's email
* address when they enter their email on the {@link auth.controller:forgotPassCtrl forgot password} page.
*
* This controller uses the {@link services.service:authentication#methods_resetPassword resetPassword} function
* in the {@link services.service:authentication authentication} service to pass the token and new password to 
* the server to be reset.
*/

(function () {

	'use strict';

	angular
	.module('auth')
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