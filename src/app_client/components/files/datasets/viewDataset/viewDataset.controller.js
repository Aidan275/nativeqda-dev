/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name datasets.controller:viewDatasetCtrl
* @requires $window
* @requires $uibModalInstance
* @requires services.service:datasetService
* @requires services.service:s3Service
* @deprecated Was added as we anticipated that analyses would have settings that could be configured per analysis, 
* so instead of needing to select multiple files each time the settings of an analysis were changed, we added the 
* concept of datasets which consisted of a selected number of files. 
* This has not happened yet so datasets only add an unnecessary step to the analysis process. 
* @description Opens a popup modal and displays the details of the selected dataset.
*
*/

(function () {

	angular
	.module('datasets')
	.controller('viewDatasetCtrl', viewDatasetCtrl);

	/* @ngInject */
	function viewDatasetCtrl(datasetId, $window, $uibModalInstance, datasetService, s3Service) {
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
			.then(function(data) {
				vm.dataset = data;
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
			.then(function(data) {
				$window.open(data, '_blank');
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