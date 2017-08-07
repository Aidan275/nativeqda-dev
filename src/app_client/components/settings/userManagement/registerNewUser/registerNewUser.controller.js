(function () {
	
	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('registerNewUserCtrl', registerNewUserCtrl);

	/* @ngInject */
	function registerNewUserCtrl($uibModalInstance, $window, NgTableParams, usersService, authentication, logger, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.register = register;
		vm.data = [];
		vm.currentPath = '';
		vm.pathsArray = [''];
		vm.tableParams;
		vm.formData = {};
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.registerButtonOptions = { buttonDefaultText: 'Register', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;

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
		vm.returnPage = $location.search().page || '/';

		///////////////////////////

		function onSubmit() {
			if (!vm.credentials.password || !vm.credentials.email || !vm.credentials.firstName || !vm.credentials.lastName) {
				logger.error("Missing fields required, please try again", '', 'Error');
				return false;
			} else {
				register();
			}
		};

		function register() {
			authentication
			.register(vm.credentials)
			.then(function(){
				$location.search('page', null); 
				$location.path(vm.returnPage);
			});
		};

	}

})();