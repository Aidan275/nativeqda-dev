(function () {

	angular
	.module('nativeQDAApp')
	.controller('forgotPassCtrl', forgotPassCtrl);

	forgotPassCtrl.$inject = ['authentication', 'logger'];
	function forgotPassCtrl(authentication, logger) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.email = "";
		vm.pageHeader = {
			title: 'Forgot Password'
		};

    	///////////////////////////

		function onSubmit() {
			vm.formError = "";
			if (!vm.email) {
				logger.error('All fields required, please try again', '', 'Error')
				return false;
			} else {
				logger.info('TODO: verify user\'s email and send link to reset password', '', 'TODO')
			}
		};
	}

})();