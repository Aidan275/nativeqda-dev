(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewDatasetCtrl', viewDatasetCtrl);

	viewDatasetCtrl.$inject = ['$uibModalInstance', 'datasets', 'datasetid'];
	function viewDatasetCtrl ($uibModalInstance, datasets, datasetid) {
		var vm = this;
		vm.datasetid = datasetid;
		
		datasets.datasetReadOne(vm.datasetid)
		.then(function(response) {
			vm.data = response.data;
		}, function (e) {
			console.log(e);
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