(function () {

	'use strict';

	angular
	.module('components.survey')
	.controller('surveyCtrl', surveyCtrl);

	/* @ngInject */
	function surveyCtrl (NgTableParams, surveyService, bsLoadingOverlayService, logger) {
		var vm = this;

		// Bindable Functions
		vm.confirmDelete = confirmDelete;
		vm.pageHeader = {
			title: 'Surveys',
			strapline: 'for the masses'
		};

		// Bindable Data
		vm.surveyList = {};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'survey-list'});	// Start animated loading overlay
			getSurveyList();
		}

		// Gets all the files from the MongoDB database
		function getSurveyList() {
			surveyService.listSurveys()
			.then(function(response) {
				vm.surveyList = response.data;
				listSurveys();
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'survey-list'});	// If error, stop animated loading overlay
			});
		}

		function listSurveys() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.surveyList
			});
			bsLoadingOverlayService.stop({referenceId: 'survey-list'});	// Stop animated loading overlay
		}

		function confirmDelete(id, surveyName) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the survey '" + surveyName + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteSurvey(id, surveyName);
			});
		}

		function deleteSurvey(id, surveyName) {
			surveyService.deleteSurvey(id)
			.then(function() {
				removeSurveyFromArray(id);	// If deleting the survey was successful, the deleted survey is removed from the local array
				logger.success("'" + surveyName + "' was deleted successfully", "", "Success");
			})
		}

		function removeSurveyFromArray(id) {	
			// Find the index for the survey, will return -1 if not found 
			var surveyIndex = vm.surveyList.findIndex(function(obj){return obj._id === id});

			// Remove the survey from the survey list array if found
			if (surveyIndex > -1) {
				vm.surveyList.splice(surveyIndex, 1);
			}

			// Re-list surveys with the updated survey list array
			listSurveys();
		}

	}

})();
