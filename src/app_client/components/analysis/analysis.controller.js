/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc controller
* @name analysis.controller:analysisCtrl
* @description Controller for the analysis page.
*/

(function () {

	angular
	.module('analysis')
	.controller('analysisCtrl', analysisCtrl);

	/* @ngInject */
	function analysisCtrl($location, NgTableParams, $uibModal, analysisService, bsLoadingOverlayService, logger) {
		var vm = this;

		/* Bindable Functions */
		vm.getAnalysesList = getAnalysesList;
		vm.confirmDelete  = confirmDelete;
		vm.popupNewAnalysis = popupNewAnalysis;
		vm.goToVisUrl = goToVisUrl;
		
		/* Bindable Data */
		vm.analyses = [];
		vm.pageHeader = {
			title: 'Analysis',
			strapline: 'where the magic happens'
		};

		activate();

		///////////////////////////

		/**
		* @ngdoc function
		* @name activate
		* @methodOf analysis.controller:analysisCtrl
		* @description Runs when the page first loads and starts the loading overlay for the analysis table and calls 
		* the {@link analysis.controller:analysisCtrl#methods_getAnalysesList getAnalysesList} function.
		*/
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'analysis-list'});	/* Start animated loading overlay */
			return getAnalysesList().then(function() {
				listAnalyses();
			});
		}

		/**
		* @ngdoc function
		* @name getAnalysesList
		* @methodOf analysis.controller:analysisCtrl
		* @description Uses the {@link services.service:analysisService#methods_listWatsonAnalysis listWatsonAnalysis} 
		* function from {@link services.service:analysisService analysisService} to load the analysis objects from the database.
		*/
		function getAnalysesList() {
			return analysisService.listWatsonAnalysis()
			.then(function(data) {
				vm.analyses = data;
				return vm.analyses;
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'analysis-list'});	/* If error, stop animated loading overlay */
			});
		}

		/**
		* @ngdoc function
		* @name listAnalyses
		* @methodOf analysis.controller:analysisCtrl
		* @description Lists the analysis objects in a table using the NgTable directive.
		*/
		function listAnalyses() {
			vm.tableParams = new NgTableParams({
				sorting: {dateCreated: "desc"}
			}, {
				dataset: vm.analyses
			});
			bsLoadingOverlayService.stop({referenceId: 'analysis-list'});	/* Stop animated loading overlay */
		}

		/**
		* @ngdoc function
		* @name confirmDelete
		* @methodOf analysis.controller:analysisCtrl
		* @param {string} name Name of the analysis object
		* @param {string} id ObjectId of the analysis object
		* @description Displays a confirmation message to confirm deletion of the passed analysis object
		*/
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

		/**
		* @ngdoc function
		* @name deleteAnalysis
		* @methodOf analysis.controller:analysisCtrl
		* @param {string} name Name of the analysis object
		* @param {string} id ObjectId of the analysis object
		* @description Uses the {@link services.service:analysisService#methods_deleteWatsonAnalysis deleteWatsonAnalysis} 
		* function from {@link services.service:analysisService analysisService} to delete the analysis object from the database.
		*/
		function deleteAnalysis(name, id) {
			analysisService.deleteWatsonAnalysis(id)
			.then(function() {
				removeFromList(id);		/* If deleting the analysis was successful, the deleted analysis is removed from the local array */
				logger.success("'" + name + "' was deleted successfully", "", "Success");
			});
		}
		
		/**
		* @ngdoc function
		* @name removeFromList
		* @methodOf analysis.controller:analysisCtrl
		* @param {string} id ObjectId of the analysis object
		* @description Removes the deleted analysis object from the local analysis array and updates the table .
		*/
		function removeFromList(id) {
			/* Find the analysis index for id, will return -1 if not found  */
			var analysisIndex = vm.analyses.findIndex(function(obj){return obj._id == id});

			/* Remove the analysis from the vm.analyses array */
			if (analysisIndex > -1) {
				vm.analyses.splice(analysisIndex, 1);
			}
			/* List the analyses again */
			listAnalyses();
		}

		/**
		* @ngdoc function
		* @name popupNewAnalysis
		* @methodOf analysis.controller:analysisCtrl
		* @description Displays the {@link analysis.controller:newAnalysisCtrl newAnalysisCtrl} modal. 
		*/
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

		/**
		* @ngdoc function
		* @name goToVisUrl
		* @methodOf analysis.controller:analysisCtrl
		* @description Goes to the visualisation page of the id specified. 
		* @param {string} id ObjectId of the analysis object
		*/
		function goToVisUrl(id) {
			$location.path('visualisations/' + id);
		}
	}

})();
