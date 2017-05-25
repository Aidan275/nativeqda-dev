(function () {

	angular
	.module('nativeQDAApp')
	.controller('newDatasetCtrl', newDatasetCtrl);

	newDatasetCtrl.$inject = ['$uibModalInstance', 'nativeQDAData'];
	function newDatasetCtrl ($uibModalInstance, nativeQDAData) {
		var vm = this;
				
		vm.onSubmit = function () {
			vm.formError = "";
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description) {
					vm.formError = "All fields required, please try again";
					return false;
				} else {
					console.log("Create Dataset!")
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