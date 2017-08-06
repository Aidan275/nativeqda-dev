(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('userManagementCtrl', userManagementCtrl);
	
	/* @ngInject */
	function userManagementCtrl (NgTableParams, bsLoadingOverlayService, $uibModal, usersService) {
		var vm = this;

		// Bindable Functions
		vm.confirmDelete = confirmDelete;

		// Bindable Data
		vm.userList = [];
		vm.pageHeader = {
			title: 'User Management',
			strapline: 'manage users of the system'
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'user-list'});	// Start animated loading overlay
			getFileList();
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			usersService.getAllUsersInfo()
			.then(function(response) {
				vm.userList = response.data;
				listUsers();
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'user-list'});	// If error, stop animated loading overlay
			});
		}

		function listUsers() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.userList
			});
			bsLoadingOverlayService.stop({referenceId: 'user-list'});	// Stop animated loading overlay
		}

		function confirmDelete() {
			console.log("Delete me!");
		}
	}
	
})();