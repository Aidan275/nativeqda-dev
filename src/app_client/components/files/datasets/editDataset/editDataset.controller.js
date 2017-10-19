/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name datasets.controller:editDatasetCtrl
* @requires $uibModalInstance
* @requires services.service:datasetService
* @deprecated Was added as we anticipated that analyses would have settings that could be configured per analysis, 
* so instead of needing to select multiple files each time the settings of an analysis were changed, we added the 
* concept of datasets which consisted of a selected number of files. 
* This has not happened yet so datasets only add an unnecessary step to the analysis process. 
* @description A popup modal for editing a dataset.
*
*/

(function () {

	angular
	.module('datasets')
	.controller('editDatasetCtrl', editDatasetCtrl);

	/* @ngInject */
	function editDatasetCtrl($uibModalInstance, datasetService) {
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