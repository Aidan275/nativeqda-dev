/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name settings.controller:userManagementCtrl
* @requires $uibModal
* @requires NgTableParams
* @requires bsLoadingOverlayService
* @requires services.service:usersService
* @requires services.service:logger
* @description This controller displays the current users of the system in a list where they
* can be edited (change permissions) and deleted. New users can also be created in this controller.
* Would like to extend the functionality of this controller so that information and user history can also be viewed,
* such as files the user has uploaded or analyses the users has created. 
*/

(function () { 

	'use strict';

	angular
	.module('settings')
	.controller('userManagementCtrl', userManagementCtrl);
	
	/* @ngInject */
	function userManagementCtrl($uibModal, NgTableParams, bsLoadingOverlayService, usersService, logger) {
		var vm = this;

		vm.pageId = 'user-management';

		// Bindable Functions
		vm.popupNewUser = popupNewUser;
		vm.popupEditUser = popupEditUser;
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
			.then(function(data) {
				vm.userList = data;
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
		
		function popupNewUser() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/settings/userManagement/registerNewUser/registerNewUser.view.html',
				controller: 'registerNewUserCtrl as vm',
				size: 'xl'
			});
			
			modalInstance.result.then(function(results) {
				vm.userList.push(results);
				listUsers();
			});
		};

		function popupEditUser(user) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/settings/userManagement/editUser/editUser.view.html',
				controller: 'editUserCtrl as vm',
				size: 'lg',
				resolve: {
					user: function() {
						return user;
					}
				}
			});
			
			modalInstance.result.then(function(results) {
				
			});
		};

		function confirmDelete(user) {
			swal({
				title: "Are you sure?",
				html: true,
				text: "<p>Confirm to delete the user '<strong>" + user.firstName + "</strong>'</p>",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete user!"
			}, function() {
				deleteUser(user);
			});
		}

		function deleteUser(user) {
			usersService.deleteUser(user.email)
			.then(function(data) {
				removeFromArray(user._id);
				logger.success("'" + user.firstName + "' was deleted successfully", "", "Success");
			});
		}

		function removeFromArray(id) {	
			/* Find the index, will return -1 if not found */
			var index = vm.userList.findIndex(function(obj){return obj._id === id});

			/* Remove the element from the array if found */
			if (index > -1) {
				vm.userList.splice(index, 1);
			}

			/* Re-list the array using the updated array */
			listUsers();
		}
	}
	
})();