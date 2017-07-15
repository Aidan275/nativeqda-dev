(function () { 

	angular
	.module('nativeQDAApp')
	.controller('editProfileCtrl', editProfileCtrl);
	
	/* @ngInject */
	function editProfileCtrl($uibModalInstance, userEmail, usersService, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.getUserInfo = getUserInfo;

		// Bindable Data
		vm.userInfo = {
			email: '', 
			firstName: '',
			lastName: '',
			company: ''
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'user-info'});	// Start animated loading overlay
			getUserInfo();
		}

		// Gets all the files from the MongoDB database
		function getUserInfo() {
			usersService.getUserInfo(userEmail)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	// Stop animated loading overlay
				vm.userInfo = response.data;
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	// If error, stop animated loading overlay
			});
		}

		vm.modal = {
			close : function() {
				$uibModalInstance.close();
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}


})();