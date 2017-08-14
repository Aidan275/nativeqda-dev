(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewDatasetCtrl', viewDatasetCtrl);

	/* @ngInject */
	function viewDatasetCtrl ($uibModalInstance, datasetService, datasetId, s3Service, $window) {
		var vm = this;

		// Bindable Functions
		vm.viewFile = viewFile;

		// Bindable Variables
		vm.files = [];

		activate();

		///////////////////////////

		function activate() {
			readDataset();
		}

		// Gets all the files from the MongoDB database
		function readDataset() {
			datasetService.datasetReadOne(datasetId)
			.then(function(response) {
				vm.dataset = response.data;
				vm.dataset.files.forEach(function(key){
					var name = key.substring(key.indexOf("-") + 1);
					var file = {};
					file.key = key;
					file.name = name;
					vm.files.push(file);
				})
			});
		}

		function viewFile(key) {
			s3Service.signDownloadKey(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

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