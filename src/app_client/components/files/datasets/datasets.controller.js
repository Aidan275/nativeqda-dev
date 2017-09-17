(function () {

	angular
	.module('auth')
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
