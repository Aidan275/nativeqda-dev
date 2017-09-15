(function () {

	angular
	.module('components.files')
	.controller('editDatasetCtrl', editDatasetCtrl);

	editDatasetCtrl.$inject = ['$uibModalInstance', 'datasetService'];
	function editDatasetCtrl ($uibModalInstance, datasetService) {
		var vm = this;

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