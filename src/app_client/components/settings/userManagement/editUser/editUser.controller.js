(function () {

	angular
	.module('nativeQDAApp')
	.controller('editUserCtrl', editUserCtrl);

	/* @ngInject */
	function editUserCtrl (user, $uibModalInstance, usersService, logger) {
		var vm = this;

		/* Bindable Functions */
		vm.onSubmit = onSubmit;

		/* Bindable Data */
		vm.userRole = ''

		///////////////////////////

		function onSubmit() {
			if (!vm.userRole) {
				logger.error('All fields required, please try again', '', 'Error')
				return false;
			} else {
				saveSettings();
			}
		};

		function saveSettings() {
			var userInfo = {
				email: user.email,
				role: vm.userRole
			};

			usersService.putUserRole(userInfo)
			.then(function(response) {
				logger.success('Successfully updated user settings', '', 'Success');
				setTimeout(function() {
					vm.modal.close(response.data);	/* Close modal if user was updated successfully */
				}, 1000);	/* Timeout function so the user can see the settings had saved before closing modal */
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