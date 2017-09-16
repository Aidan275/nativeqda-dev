(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyResponseListCtrl', surveyResponseListCtrl);

	/* @ngInject */
	function surveyResponseListCtrl($routeParams, surveyService, bsLoadingOverlayService, NgTableParams, logger) {
		var vm = this;
		vm.accessId = $routeParams.accessId;

		// Bindable Functions
		vm.confirmDelete = confirmDelete;

		// Bindable Data
		vm.surveyResponsesList = [];

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'survey-responses'});	// Start animated loading overlay
			getSurveyResponsesList();
		}

		// Gets all the survey responses from the MongoDB database
		function getSurveyResponsesList() {
			surveyService.readSurveyResponses(vm.accessId)
			.then(function(response) {
				response.data.responses.forEach(function(response) {
					var data = {
						responseJSON: JSON.parse(response.responseJSON),
						dateCreated: response.dateCreated,
						fullName: response.fullName,
						email: response.email,
						age: response.age,
						gender: response.gender,
						id: response._id,
						coords: {
							lat: response.coords.coordinates[1],
							lng: response.coords.coordinates[0]
						}
					};

					if(data.coords.lat && data.coords.lng) {
						data.location = true;
					} else {
						data.location = false;
					}

					vm.surveyResponsesList.push(data);
				});
				console.log(vm.surveyResponsesList);
				listSurveyResponses();
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'survey-responses'});	// If error, stop animated loading overlay
			});
		}

		function listSurveyResponses() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.surveyResponsesList
			});
			bsLoadingOverlayService.stop({referenceId: 'survey-responses'});	// Stop animated loading overlay
		}

		function confirmDelete(id) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete this survey response",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteSurveyResponse(id);
			});
		}

		function deleteSurveyResponse(id) {
			// Still need to add DB functions for deleting
			removeSurveyResponseFromArray(id);	// If deleting the survey response was successful, the deleted survey response is removed from the local array
			logger.success("The survey response was deleted successfully", "", "Success");

		}

		function removeSurveyResponseFromArray(id) {	
			// Find the index for the survey response, will return -1 if not found 
			var responseIndex = vm.surveyResponsesList.findIndex(function(obj){return obj._id === id});

			// Remove the survey from the survey list array if found
			if (responseIndex > -1) {
				vm.surveyResponsesList.splice(responseIndex, 1);
			}

			// Re-list survey responses with the updated survey response list array
			listSurveyResponses();
		}


	}

})();
