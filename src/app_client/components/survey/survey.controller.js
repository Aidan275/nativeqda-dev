/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name survey.controller:surveyCtrl
* @requires $location
* @requires services.service:surveyService
* @requires services.service:logger
* @description This controller is for the main survey page, where all the created surveys are listed.
* From the survey page, surveys and survey responses can be created, previewed, viewed, and deleted.
*/
(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyCtrl', surveyCtrl);

	/* @ngInject */
	function surveyCtrl($location, NgTableParams, surveyService, bsLoadingOverlayService, logger) {
		var vm = this;
		
		vm.pageId = 'survey-page-css';

		// Bindable Functions
		vm.confirmDelete = confirmDelete;
		vm.goToResponsesUrl = goToResponsesUrl;
		vm.pageHeader = {
			title: 'Surveys',
			strapline: 'create, edit and view'
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
			.then(function(data) {
				vm.surveyList = data;
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

		function goToResponsesUrl(id) {
			$location.path('survey/responses/' + id);
		}

	}

})();
