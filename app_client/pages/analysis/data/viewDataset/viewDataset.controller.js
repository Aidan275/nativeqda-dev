(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewDatasetCtrl', viewDatasetCtrl);

	viewDatasetCtrl.$inject = ['$uibModalInstance', 'datasetService', 'datasetId'];
	function viewDatasetCtrl ($uibModalInstance, datasetService, datasetId) {
		var vm = this;
		
		datasetService.datasetReadOne(datasetId)
		.then(function(response) {
			vm.data = response.data;
		});

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