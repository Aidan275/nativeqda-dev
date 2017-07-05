(function () {

	angular
	.module('nativeQDAApp')
	.controller('visualisationCtrl', visualisationCtrl);

	visualisationCtrl.$inject = ['$scope', '$window', 'NgTableParams', '$sce', '$uibModal'];
	function visualisationCtrl ($scope, $window, NgTableParams, $sce, $uibModal) {
		var vm = this;

		// Bindable Functions
		vm.getVisualsList = getVisualsList;
		vm.confirmDelete  = confirmDelete;
		vm.popupNewVisual = popupNewVisual;
		//vm.popupViewVisual = popupViewVisual;
		//vm.popupEditVisual = popupEditVisual;
		
		// Bindable Data
		vm.visuals = [];
		vm.pageHeader = {
			title: 'Visualisation',
			strapline: 'visualise datasets here'
		};

		activate();

		///////////////////////////

		function activate() {
			getVisualsList();
		}

		function getVisualsList() {
			vm.visuals = [
			{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'English vs French', createdBy: 'Anu', dateCreated: '2017/04/25', _id: '1'},
			{ visual: 'Word Cloud', visualThumb: 'word-cloud-thumb.png', dataSet: 'English vs French', createdBy: 'Anu', dateCreated: '2016/01/12', _id: '2'},
			{ visual: 'Chord Diagram', visualThumb: 'chord-diagram-thumb.png', dataSet: 'English vs French', createdBy: 'Anu',  dateCreated: '2016/03/29', _id: '3'},
			{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'Kanaks - Drehu', createdBy: 'Michael', dateCreated: '2016/09/15', _id: '4'},
			{ visual: 'Concept Map', visualThumb: 'concept-map-thumb.png', dataSet: 'English vs French', createdBy: 'Anu',  dateCreated: '2017/04/25', _id: '5'},
			{ visual: 'Word Frequency Chart', visualThumb: 'bar-chart-thumb.png', dataSet: 'Kanaks - Drehu', createdBy: 'Michael', dateCreated: '2016/01/12', _id: '6'},
			{ visual: 'Word Tree', visualThumb: 'word-tree-thumb.png', dataSet: 'Qualitative study of the Moriori language', createdBy: 'Michael', dateCreated: '2017/03/29', _id: '7'}
			];
			ListVisuals();
		}

		function ListVisuals() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.visuals
			});
		}

		function confirmDelete(name, visualId) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the visualisation '" + name + "'",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteVisual(visualId);
			});
		};

		function deleteVisual(visualId) {
			// Add DB component
			removeFromList(visualId);	// if deleting the visual was successful, 
		}								// the deleted visual is removed from the local array
		
		function removeFromList(visualId) {
			// Find the visual index for visualId, will return -1 if not found 
			var visualIndex = vm.visuals.findIndex(function(obj){return obj._id == visualId});

			// Remove the visual from the vm.visuals array
			if (visualIndex > -1) {
				vm.visuals.splice(visualIndex, 1);
			}

			// List the visuals again
			ListVisuals();
		}

		function popupNewVisual() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/analysis/visualisation/newVisualisation/newVisualisation.view.html',
				controller: 'newVisualisationCtrl as vm',
				size: 'xl'
			});
			
			modalInstance.result.then(function () {

			});
		};
	}

})();
