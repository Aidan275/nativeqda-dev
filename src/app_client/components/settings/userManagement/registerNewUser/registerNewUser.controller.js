(function () {
	
	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('registerNewUserCtrl', registerNewUserCtrl);

	/* @ngInject */
	function registerNewUserCtrl($uibModalInstance, authentication, logger) {
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
			authentication
			.createUser(vm.credentials)
			.then(function(response) {
				logger.success("New user created successfully", '', 'Success');
				vm.modal.close(response.data);			
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