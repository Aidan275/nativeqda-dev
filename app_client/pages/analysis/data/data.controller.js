(function () {

	angular
	.module('nativeQDAApp')
	.controller('dataCtrl', dataCtrl);

	dataCtrl.$inject = ['$window', '$sce', '$uibModal', 'NgTableParams', 'datasetService'];
	function dataCtrl($window, $sce, $uibModal, NgTableParams, datasetService) {
		var vm = this;
		
		vm.dataset;

		vm.popupViewDatasetForm = popupViewDatasetForm;
		vm.popupEditDatasetForm = popupEditDatasetForm;
		vm.popupNewDatasetForm = popupNewDatasetForm;
		vm.getDatasetList = getDatasetList;
		vm.confirmDelete  = confirmDelete;

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
    			ListDatasets(response.data);
    		});
    	}

    	function ListDatasets(datasetList) {
    		vm.dataset = datasetList
    		vm.tableParams = new NgTableParams({
    			sorting: {dateCreated: "desc"}
    		}, {
    			dataset: vm.dataset
    		});
    	};

    	function confirmDelete(name, datasetId) {
    		var doDelete = $window.confirm("Are you sure you want to delete " + name + "?");
    		if(doDelete){
    			deleteDataset(datasetId);
    		}
    	};

    	function deleteDataset(datasetId) {
    		datasetService.datasetDeleteOne(datasetId)
    		.then(function(response) {
    			getDatasetList();
    		});
    	}

    	function popupViewDatasetForm(datasetId) {
    		var modalInstance = $uibModal.open({
    			templateUrl: '/pages/analysis/data/viewDataset/viewDataset.view.html',
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
    	};

    	function popupEditDatasetForm(name, datasetId) {
    		var modalInstance = $uibModal.open({
    			templateUrl: '/pages/analysis/data/editDataset/editDataset.view.html',
    			controller: 'editDatasetCtrl as vm',
    			size: 'xl'
    		});

    		modalInstance.result.then(function() {
    			getDatasetList();
    		});
    	};

    	function popupNewDatasetForm() {
    		var modalInstance = $uibModal.open({
    			templateUrl: '/pages/analysis/data/newDataset/newDataset.view.html',
    			controller: 'newDatasetCtrl as vm',
    			size: 'xl'
    		});

    		modalInstance.result.then(function(data) {
    			vm.dataset.push(data)
    			ListDatasets(vm.dataset);
    		});
    	};

    }

})();
