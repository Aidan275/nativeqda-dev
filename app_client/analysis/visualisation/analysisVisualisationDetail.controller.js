(function () {

	angular
	.module('nativeQDAApp')
	.controller('analysisVisCtrl', analysisVisCtrl);

	analysisVisCtrl.$inject = ['$scope', '$window', 'NgTableParams', '$sce'];
	function analysisVisCtrl ($scope, $window, NgTableParams, $sce) {
		var vm = this;
		
		vm.pageHeader = {
			title: 'Visualisation',
			strapline: 'visualise data sets here'
		};

		var dataset = [
		{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'English vs French', createdBy: 'Anu', dateCreated: '2017/04/25', command: 'id1'},
		{ visual: 'Word Cloud', visualThumb: 'word-cloud-thumb.png', dataSet: 'English vs French', createdBy: 'Anu', dateCreated: '2016/01/12', command: 'id2'},
		{ visual: 'Chord Diagram', visualThumb: 'chord-diagram-thumb.png', dataSet: 'English vs French', createdBy: 'Anu',  dateCreated: '2016/03/29', command: 'id3'},
		{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'Kanaks - Drehu', createdBy: 'Michael', dateCreated: '2016/09/15', command: 'id4'},
		{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'English vs French', createdBy: 'Anu',  dateCreated: '2017/04/25', command: 'id5'},
		{ visual: 'Word Frequency Chart', visualThumb: 'bar-chart-thumb.png', dataSet: 'Kanaks - Drehu', createdBy: 'Michael', dateCreated: '2016/01/12', command: 'id6'},
		{ visual: 'Word Tree', visualThumb: 'word-tree-thumb.png', dataSet: 'Qualitative study of the Moriori language', createdBy: 'Michael', dateCreated: '2017/03/29', command: 'id7'},
		];

		vm.tableParams = new NgTableParams({}, { dataset: dataset});

		$scope.confirmDelete = function () {
			$window.confirm("Are ya sure?")
		};

	}

})();
