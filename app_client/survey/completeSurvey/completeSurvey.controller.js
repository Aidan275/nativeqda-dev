(function () {

	angular
	.module('nativeQDAApp')
	.controller('CompleteSurveyCtrl', CompleteSurveyCtrl);

	function CompleteSurveyCtrl() {
		var vm = this;

		vm.surveyCode = "";

		vm.onSubmit = function () {
			vm.formError = "";
			if (!vm.surveyCode) {
				vm.formError = "All fields required, please try again";
				return false;
			} else {
				console.log("Find survey and display to user!")
			}
		};
	}

})();
