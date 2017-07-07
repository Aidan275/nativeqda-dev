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
			getUserInfo();
		}

		// Gets all the files from the MongoDB database
		function getUserInfo() {
			bsLoadingOverlayService.start({referenceId: 'user-info'});
			usersService.getUserInfo(userEmail)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'user-info'});
				vm.userInfo = response.data;
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