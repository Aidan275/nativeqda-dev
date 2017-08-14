(function () {

	angular
	.module('nativeQDAApp')
	.controller('analysisCtrl', analysisCtrl);

	/* @ngInject */
	function analysisCtrl ($scope, $window, NgTableParams, $sce, $uibModal, analysisService, bsLoadingOverlayService, logger) {
		var vm = this;

		// Bindable Functions
		vm.getAnalysesList = getAnalysesList;
		vm.confirmDelete  = confirmDelete;
		vm.popupNewAnalysis = popupNewAnalysis;
		
		// Bindable Data
		vm.analyses = [];
		vm.pageHeader = {
			title: 'Analysis',
			strapline: 'where the magic happens'
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'analysis-list'});	// Start animated loading overlay
			getAnalysesList();
		}

		function getAnalysesList() {
			analysisService.listWatsonAnalysis()
			.then(function(response) {
				vm.analyses = response.data;
				listAnalyses();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'analysis-list'});	// If error, stop animated loading overlay
			});
		}

		function listAnalyses() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.analyses
			});
			bsLoadingOverlayService.stop({referenceId: 'analysis-list'});	// Stop animated loading overlay
		}

		function confirmDelete(name, id) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the analysis '" + name + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteAnalysis(name, id);
			});
		};

		function deleteAnalysis(name, id) {
			analysisService.deleteWatsonAnalysis(id)
			.then(function() {
				removeFromList(id);	// If deleting the analysis was successful, the deleted analysis is removed from the local array
				logger.success("'" + name + "' was deleted successfully", "", "Success");
			});
		}
		
		function removeFromList(id) {
			// Find the analysis index for id, will return -1 if not found 
			var analysisIndex = vm.analyses.findIndex(function(obj){return obj._id == id});

			// Remove the analysis from the vm.analyses array
			if (analysisIndex > -1) {
				vm.analyses.splice(analysisIndex, 1);
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
