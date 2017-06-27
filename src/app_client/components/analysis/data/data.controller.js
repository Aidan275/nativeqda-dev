(function () {

	angular
	.module('nativeQDAApp')
	.controller('dataCtrl', dataCtrl);

	dataCtrl.$inject = ['$window', '$sce', '$uibModal', 'NgTableParams', 'datasetService', 'logger'];
	function dataCtrl($window, $sce, $uibModal, NgTableParams, datasetService, logger) {
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
			title: 'Data',
			strapline: 'where the Datasets live'
		};

		activate();

		///////////////////////////

		function activate() {
			getDatasetList();
		}

		function getDatasetList() {
			datasetService.listDatasets()
			.then(function(response) {
				vm.dataset = response.data
				ListDatasets();
			});
		}

		function ListDatasets() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.dataset
			});
		}

		function confirmDelete(name, datasetId) {
			var doDelete = $window.confirm("Are you sure you want to delete " + name + "?");
			if(doDelete){
				deleteDataset(name, datasetId);
			}
		}

		function deleteDataset(name, datasetId) {
			datasetService.datasetDeleteOne(datasetId)
			.then(function(response) {
				logger.success('Dataset "' + name + '" was successfully deleted' ,'', 'Success');
				removeFromList(datasetId);	// if deleting the dataset was successful, 
			});								// the deleted dataset is removed from the local array
		}

		function removeFromList(datasetId) {
			// Find the dataset index for datasetId, will return -1 if not found 
			var datasetIndex = vm.dataset.findIndex(function(obj){return obj._id == datasetId});

			// Remove the dataset from the vm.dataset array
			if (datasetIndex > -1) {
				vm.dataset.splice(datasetIndex, 1);
			}

			// List the datasets again
			ListDatasets();
		}

		function popupViewDataset(datasetId) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/analysis/data/viewDataset/viewDataset.view.html',
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
				templateUrl: '/components/analysis/data/editDataset/editDataset.view.html',
				controller: 'editDatasetCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function() {

			});
		}

		function popupNewDataset() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/analysis/data/newDataset/newDataset.view.html',
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
