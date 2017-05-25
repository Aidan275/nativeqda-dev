(function () {

	angular
	.module('nativeQDAApp')
	.controller('dataCtrl', dataCtrl);

	dataCtrl.$inject = ['$scope', '$window', 'NgTableParams', '$sce', '$uibModal'];
	function dataCtrl ($scope, $window, NgTableParams, $sce, $uibModal) {
		var vm = this;
		
		vm.pageHeader = {
			title: 'Data',
			strapline: 'where the Datasets live'
		};

		vm.popupNewDatasetForm = function () {
			var modalInstance = $uibModal.open({
				templateUrl: '/analysis/data/newDataset/newDataset.view.html',
				controller: 'newDatasetCtrl as vm',
				size: 'xl'
			});
			
			modalInstance.result.then(function () {

			});
		};

		var dataset = [
		{ dataset: 'English vs French', createdBy: 'Anu', description: 'Interviews from French speakers in New Caledonia', dateCreated: '2011/04/25', command: 'id1'},
		{ dataset: 'Inheritance of Bunuban', createdBy: 'Anu', description: 'Bunuban inheritance study', dateCreated: '2009/01/12', command: 'id2'},
		{ dataset: 'Qualitative study of the Moriori', createdBy: 'Michael', description: 'Moriori language evolution', dateCreated: '2012/03/29', command: 'id3'},
		{ dataset: 'Kanaks - Drehu', createdBy: 'Michael', description: 'Drehu', dateCreated: '2008/11/28', command: 'id4'},
		{ dataset: 'Kanaks French dialect', createdBy: 'Holly', description: 'French', dateCreated: '2012/12/02', command: 'id29'},
		{ dataset: 'Decline of the Bunuban family', createdBy: 'Anu', description: 'Bunuban Family study', dateCreated: '2011/07/25', command: 'id30'}
		];

		/* Changed method - may use again...
		
		vm.cols = [{
			field: "dataset",
			title: "Data Set",
			sortable: "dataset",
			filter: { dataset: "text" },
			show: true,
			getValue: exactValue
		}, {
			field: "createdBy",
			title: "Created By",
			sortable: "createdBy",
			filter: { createdBy: "text" },
			show: true,
			getValue: exactValue
		}, {
			field: "description",
			title: "Description",
			sortable: "description",
			filter: { description: "text" },
			show: true,
			getValue: exactValue
		}, {
			field: "dateCreated",
			title: "Date Created",
			sortable: "dateCreated",
			filter: { dateCreated: "text" },
			show: true,
			getValue: exactValue
		}, {
			field: "command",
			title: "Command",
			show: true,
			getValue: htmlValue
		}];

		function htmlValue($scope, row) {
			var value = row[this.field];
			//var html = "<a href='https://www.google.co.uk/search?q=" + value + "' target='_blank'><em>" + value + "</em></a>";
			// must use directive "initBind.directive.js" to compile the directives included in the HTML (e.g. ng-click="confirmDelete()")
			return $sce.trustAsHtml(value);
		}

		function exactValue($scope, row) {
			return row[this.field];
		}

		*/

		vm.tableParams = new NgTableParams({}, { dataset: dataset});

		$scope.confirmDelete = function () {
			$window.confirm("Are ya sure?")
		};

	}

})();
