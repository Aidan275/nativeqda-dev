(function () {

	angular
	.module('nativeQDAApp')
	.controller('newDatasetCtrl', newDatasetCtrl);

	newDatasetCtrl.$inject = ['$uibModalInstance', 'datasets'];
	function newDatasetCtrl ($uibModalInstance, datasets) {
		var vm = this;

		vm.onSubmit = function () {
			vm.formError = "";
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description) {
					vm.formError = "All fields required, please try again";
					return false;
				} else {
					vm.doCreateDataset(vm.formData);
				}
			} else {
				vm.formError = "All fields required, please try again";
				return false;
			}
		};

		vm.doCreateDataset = function (formData) {
			datasets.datasetCreate({
				name: vm.formData.datasetName,
				desc: vm.formData.description
			})
			.then(function (response) {
				vm.modal.close(response.data); 
			}, function (e) {
				vm.formError = "The Dataset was not saved, please try again";
			});
			return false;
		};

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