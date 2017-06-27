(function () {

	angular
	.module('nativeQDAApp')
	.controller('newDatasetCtrl', newDatasetCtrl);

	newDatasetCtrl.$inject = ['$uibModalInstance', 'datasetService', 'logger'];
	function newDatasetCtrl ($uibModalInstance, datasetService, logger) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.doCreateDataset = doCreateDataset;

		///////////////////////////

		function onSubmit() {
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				} else {
					doCreateDataset(vm.formData);
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		};

		function doCreateDataset(formData) {
			datasetService.datasetCreate({			// Using the datasetService, makes an API request to
				name: vm.formData.datasetName,		// the server to add the new dataset
				desc: vm.formData.description
			})
			.then(function (response) {
				logger.success('Dataset "' + vm.formData.datasetName + '" was created successfully', '', 'Success')
				vm.modal.close(response.data);	// Close modal if dataset was created successfully in DB
			});									// and return the response from the DB (the new dataset)
		};

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	// Return results
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();