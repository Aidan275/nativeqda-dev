/**
* @author Reece Denaro
* @email rd923@uowmail.edu.au
* @ngdoc controller
* @name settings.controller:registerNewUserCtrl
* @requires $uibModalInstance
* @requires services.service:usersService
* @requires services.service:logger
* @description This controller is for a popup modal that contains a form for a current
* user to enter the details of a new user to be registered for the system.
*/

(function () {
	
	'use strict';

	angular
	.module('settings')
	.controller('registerNewUserCtrl', registerNewUserCtrl);

	/* @ngInject */
	function registerNewUserCtrl($uibModalInstance, usersService, logger) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.credentials = {
			password : "",
			email : "",
			firstName : "",
			lastName : "",
			company : ""
		};
		
		vm.pageHeader = {
			title: 'Create a new NativeQDA account'
		};
		
		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.password || !vm.credentials.email || !vm.credentials.firstName || !vm.credentials.lastName) {
				logger.error("Missing fields required, please try again", '', 'Error');
				return false;
			} else {
				createUser();
			}
		};

		function createUser() {
			usersService
			.createUser(vm.credentials)
			.then(function(data) {
				logger.success("New user created successfully", '', 'Success');
				vm.modal.close(data);			
			});
		};
		
		vm.modal = {
			close : function(newUser) {
				$uibModalInstance.close(newUser);
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();