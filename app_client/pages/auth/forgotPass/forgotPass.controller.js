(function () {

	angular
	.module('nativeQDAApp')
	.controller('forgotPassCtrl', forgotPassCtrl);

	forgotPassCtrl.$inject = ['authentication'];
	function forgotPassCtrl(authentication) {
		var vm = this;

		vm.pageHeader = {
			title: 'Forgot Password'
		};

		vm.credentials = {
			email : ""
		};

		vm.onSubmit = function () {
			vm.formError = "";
			if (!vm.credentials.email) {
				vm.formError = "All fields required, please try again";
				return false;
			} else {
				console.log("Send email to " + vm.credentials.email + " to reset password!")
			}
		};
	}

})();