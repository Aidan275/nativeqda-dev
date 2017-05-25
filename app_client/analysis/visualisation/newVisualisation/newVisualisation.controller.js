(function () {

	angular
	.module('nativeQDAApp')
	.controller('newVisualisationCtrl', newVisualisationCtrl);

	newVisualisationCtrl.$inject = ['$uibModalInstance', 'nativeQDAData'];
	function newVisualisationCtrl ($uibModalInstance, nativeQDAData) {
		var vm = this;
				
		vm.onSubmit = function () {
			vm.formError = "";
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.visualisationName) {
					vm.formError = "All fields required, please try again";
					return false;
				} else {
					console.log("Create Visualisation!")
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