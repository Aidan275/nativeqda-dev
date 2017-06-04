(function () {

	angular
	.module('nativeQDAApp')
	.controller('dataCtrl', dataCtrl);

	dataCtrl.$inject = ['$scope', '$window', 'NgTableParams', '$sce', '$uibModal', 'datasets'];
	function dataCtrl($scope, $window, NgTableParams, $sce, $uibModal, datasets) {
		var vm = this;
		var dataset;

		vm.pageHeader = {
			title: 'Data',
			strapline: 'where the Datasets live'
		};

		vm.popupNewDatasetForm = function() {
			var modalInstance = $uibModal.open({
				templateUrl: '/analysis/data/newDataset/newDataset.view.html',
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
				sorting: {dateCreated: "asc"}
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

		$scope.confirmDelete = function(name, datasetid) {
			deleteDataset = $window.confirm("Are you sure you want to delete " + name + "?");
			if(deleteDataset){
				vm.doDeleteDataset(datasetid);
			}
		};

	}

})();
