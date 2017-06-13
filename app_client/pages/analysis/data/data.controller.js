(function () {

	angular
	.module('nativeQDAApp')
	.controller('dataCtrl', dataCtrl);

	dataCtrl.$inject = ['$window', '$sce', '$uibModal', 'NgTableParams', 'datasets'];
	function dataCtrl($window, $sce, $uibModal, NgTableParams, datasets) {
		var vm = this;
		var dataset;

		vm.pageHeader = {
			title: 'Data',
			strapline: 'where the Datasets live'
		};

		vm.popupViewDatasetForm = function(datasetid) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/analysis/data/viewDataset/viewDataset.view.html',
				controller: 'viewDatasetCtrl as vm',
				size: 'lg',
				resolve: {
					datasetid: function () {
						return datasetid;
					}
				}
			});

			modalInstance.result.then(function() {

			});
		};

		vm.popupEditDatasetForm = function(name, datasetid) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/analysis/data/editDataset/editDataset.view.html',
				controller: 'editDatasetCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function() {
				vm.getDatasetList();
			});
		};

		vm.popupNewDatasetForm = function() {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/analysis/data/newDataset/newDataset.view.html',
				controller: 'newDatasetCtrl as vm',
				size: 'xl'
			});

			modalInstance.result.then(function() {
				vm.getDatasetList();
			});
		};

		vm.doListDatasets = function(datasetList) {
			dataset = datasetList;
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: dataset
			});
		};

		vm.getDatasetList = function() {
			datasets.listDatasets()
			.then(function(response) {
				vm.doListDatasets(response.data);
			}, function(e) {
				console.log(e);
			});
			return false;
		}

		vm.getDatasetList();

		vm.doDeleteDataset = function(datasetid) {
			datasets.datasetDeleteOne(datasetid)
			.then(function(response) {
				vm.getDatasetList();
			}, function(e) {
				console.log(e);
			});
			return false;
		}

		vm.confirmDelete = function(name, datasetid) {
			deleteDataset = $window.confirm("Are you sure you want to delete " + name + "?");
			if(deleteDataset){
				vm.doDeleteDataset(datasetid);
			}
		};

	}

})();
