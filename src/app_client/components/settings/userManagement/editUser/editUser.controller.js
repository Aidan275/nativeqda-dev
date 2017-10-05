(function () {

	angular
	.module('settings')
	.controller('editUserCtrl', editUserCtrl);

	/* @ngInject */
	function editUserCtrl (user, $uibModalInstance, usersService, authService, logger) {
		var vm = this;

		/* Bindable Functions */
		vm.onSubmit = onSubmit;

		/* Bindable Data */
		vm.isAdmin = ''

		///////////////////////////

		function onSubmit() {
			if (!vm.isAdmin) {
				logger.error('All fields required, please try again', '', 'Error')
				return false;
			} else {
				saveSettings();
			}
		};

		function saveSettings() {
			var userInfo = {
				email: user.email,
				isAdmin: vm.isAdmin
			};

			usersService.updateProfile(userInfo)
			.then(function(data) {)
				authService.saveToken(data)
				logger.success('Successfully updated user settings', '', 'Success');
				setTimeout(function() {
					vm.modal.close(data);	/* Close modal if user was updated successfully */
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