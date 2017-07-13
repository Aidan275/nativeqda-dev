(function () {

	angular
	.module('nativeQDAApp')
	.controller('analysisCtrl', analysisCtrl);

	/* @ngInject */
	function analysisCtrl ($scope, $window, NgTableParams, $sce, $uibModal, analysisService, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.getAnalysesList = getAnalysesList;
		vm.confirmDelete  = confirmDelete;
		vm.popupNewAnalysis = popupNewAnalysis;
		//vm.popupViewVisual = popupViewVisual;
		//vm.popupEditVisual = popupEditVisual;
		
		// Bindable Data
		vm.analyses = [];
		vm.pageHeader = {
			title: 'Analysis',
			strapline: 'where the magic happens'
		};

		activate();

		///////////////////////////

		function activate() {
			getAnalysesList();
		}

		function getAnalysesList() {
			bsLoadingOverlayService.start({referenceId: 'analysis-list'});
			analysisService.listWatsonAnalysis()
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'analysis-list'});
				vm.analyses = response.data;
				console.log(vm.analyses);
				listAnalyses();
			});
		}

		function listAnalyses() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.analyses
			});
		}

		function confirmDelete(name, visualId) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the analysis '" + name + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
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

			// List the analyses again
			listAnalyses();
		}

		function popupNewAnalysis() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/analysis/newAnalysis/newAnalysis.view.html',
				controller: 'newAnalysisCtrl as vm',
				size: 'xl'
			});
			
			modalInstance.result.then(function (results) {
				vm.analyses.push(results);
				listAnalyses();
			});
		};
	}

})();
