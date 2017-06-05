(function () {

	angular
	.module('nativeQDAApp')
	.controller('newSurveyCtrl', newSurveyCtrl);

	newSurveyCtrl.$inject = ['$uibModalInstance'];
	function newSurveyCtrl ($uibModalInstance) {
		var vm = this;
				
		vm.onSubmit = function () {
			vm.formError = "";
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.surveyName) {
					vm.formError = "All fields required, please try again";
					return false;
				} else {
					console.log("Create Survey!")
				}
			} else {
				vm.formError = "All fields required, please try again";
				return false;
			}
		};

		vm.modal = {
			close : function (result) {
				$uibModalInstance.close(result);
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();