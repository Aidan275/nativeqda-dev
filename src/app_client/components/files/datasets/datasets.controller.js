/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name datasets.controller:datasetsCtrl
* @requires $window
* @requires $sce
* @requires $uibModal
* @requires NgTableParams
* @requires bsLoadingOverlayService
* @requires services.service:datasetService
* @requires services.service:logger
* @requires services.service:filesService
* @requires services.service:s3Service
* @deprecated Was added as we anticipated that analyses would have settings that could be configured per analysis, 
* so instead of needing to select multiple files each time the settings of an analysis were changed, we added the 
* concept of datasets which consisted of a selected number of files. 
* This has not happened yet so datasets only add an unnecessary step to the analysis process. 
* @description Displays the existing datasets and gave the options to create, view, edit, and delete these datasets.
*/

(function () {

	angular
	.module('datasets')
	.controller('datasetsCtrl', datasetsCtrl);

	/* @ngInject */
	function datasetsCtrl($window, $sce, $uibModal, NgTableParams, datasetService, logger, filesService, bsLoadingOverlayService, s3Service) {
		var vm = this;
		
		// Bindable Functions
		vm.getDatasetList = getDatasetList;
		vm.confirmDelete  = confirmDelete;
		vm.popupViewDataset = popupViewDataset;
		vm.popupEditDataset = popupEditDataset;
		vm.popupNewDataset = popupNewDataset;

		// Bindable Data
		vm.dataset = [];
		vm.pageHeader = {
			title: 'Datasets',
			strapline: 'where the Datasets live'
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'dataset-list'});	// Start animated loading overlay
			getDatasetList();
		}

		function getDatasetList() {
			datasetService.listDatasets()
			.then(function(data) {
				vm.dataset = data
				ListDatasets();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'dataset-list'});	// If error, stop animated loading overlay
			});
		}

		function ListDatasets() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.dataset
			});
			bsLoadingOverlayService.stop({referenceId: 'dataset-list'});	// Stop animated loading overlay
		}

		function confirmDelete(key, datasetName) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the dataset '" + datasetName + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteDatasetDB(key, datasetName);
			});
		}

		function deleteDatasetDB(key, datasetName) {
			datasetService.deleteDatasetDB(key)
			.then(function(data) {
				deleteDatasetS3(key, datasetName);
			});
		}

		function deleteDatasetS3(key, datasetName) {
			s3Service.deleteFile(key)
			.then(function(data) {
				removeFromList(key);	// if deleting the dataset was successful, the deleted dataset is removed from the local array
				logger.success('Dataset "' + datasetName + '" was successfully deleted' ,'', 'Success');
			});
		}

		function removeFromList(key) {
			// Find the dataset index for key, will return -1 if not found 
			var datasetIndex = vm.dataset.findIndex(function(obj){return obj.key == key});

			// Remove the dataset from the vm.dataset array
			if (datasetIndex > -1) {
				vm.dataset.splice(datasetIndex, 1);
			}

			// List the datasets again
			ListDatasets();
		}

		function popupViewDataset(datasetId) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/datasets/viewDataset/viewDataset.view.html',
				controller: 'viewDatasetCtrl as vm',
				size: 'lg',
				resolve: {
					datasetId: function () {
						return datasetId;
					}
				}
			});

			modalInstance.result.then(function() {

			});
		}

		function popupEditDataset(name, datasetId) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/datasets/editDataset/editDataset.view.html',
				controller: 'editDatasetCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function() {

			});
		}

		function popupNewDataset() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/datasets/newDataset/newDataset.view.html',
				controller: 'newDatasetCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function(data) {
				vm.dataset.push(data)
				ListDatasets();
			});
		}

	}

})();
