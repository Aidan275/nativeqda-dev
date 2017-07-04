(function () {

	angular
	.module('nativeQDAApp')
	.controller('newDatasetCtrl', newDatasetCtrl);

	/* @ngInject */
	function newDatasetCtrl ($uibModalInstance, datasetService, filesService, logger, NgTableParams) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.doCreateDataset = doCreateDataset;

		// Bindable Data
		vm.formData;
		vm.fileList = null;
		vm.datasetFiles = null;

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				listFiles();
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.fileList
			});
		}

		function onSubmit() {
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description || !vm.formData.checkboxes) {
					logger.error('All fields required, please try again', '', 'Error');
				} else {
					doCreateDataset(vm.formData);
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		};

		function doCreateDataset(formData) {
			var keys = Object.keys(vm.formData.checkboxes);		// Checks the checkbox object and any key that is true, 
			vm.datasetFiles = keys.filter(function(key) {		// the key is saved into the vm.datasetFiles array
				return vm.formData.checkboxes[key]
			});

			datasetService.datasetCreate({			// Using the datasetService, makes an API request to
				name: vm.formData.datasetName,		// the server to add the new dataset
				desc: vm.formData.description,
				files: vm.datasetFiles
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