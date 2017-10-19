/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name survey.controller:surveyCreateCtrl
* @requires $scope
* @requires $location
* @requires services.service:surveyService
* @requires services.service:authService
* @description This controller displays the survey editor where a user can create a survey. 
* The resulting JSON code of the created survey can then be saved to the database.
*/

(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyCreateCtrl', surveyCreateCtrl);

	/* @ngInject */
	function surveyCreateCtrl($scope, $location, surveyService, authService) {
		var vm = this;

		var editorOptions = {
			// show the embeded survey tab. It is hidden by default
			showEmbededSurveyTab : false,
			// hide the test survey tab. It is shown by default
			showTestSurveyTab : true,
			// hide the JSON text editor tab. It is shown by default
			showJSONEditorTab : false,
			// show the "Options" button menu. It is hidden by default 
			showOptions: false,
			// generates valid JSON so it can be saved as a string into the DB and used for displaying the surveys
			generateValidJSON: true                     
		};

		// pass the editorOptions into the constructor. It is an optional parameter.
		var survey = new SurveyEditor.SurveyEditor("surveyEditorContainer", editorOptions);

		//set function on save callback
		survey.saveSurveyFunc = saveMySurvey;

		function saveMySurvey(){
			swal({
				title: "Save Survey",
				text: "Please enter a name for this survey",
				type: "input",
				confirmButtonColor: "#5cb85c",
				showCancelButton: true,
				closeOnConfirm: false,
				allowOutsideClick: true,
				animation: "slide-from-top",
				inputPlaceholder: "Survey Name"
			},
			function(inputValue){
				if (inputValue === false) {
					return false;
				}

				if (inputValue === "") {
					swal.showInputError("You need to write something!");
					return false;
				}

				var surveyData = {
					surveyJSON: survey.text,
					name: inputValue,
					createdBy : authService.currentUser().firstName
				};

				surveyService.saveSurvey(surveyData)
				.then(function(data) {
					swal({
						title: "Saved!",
						text: "Survey saved as '" + inputValue + "'\nThis survey's code is " + data.accessId,
						type: "success",
						confirmButtonColor: "#5cb85c",
						animation: "slide-from-top"
					},
					function(){
						$location.path("/survey");
						$scope.$apply();
					});
				});
			});
		}


/*		// Prevent the user from navigating away from the page without saving first
		$scope.$on('$locationChangeStart', function( event ) {
			var answer = confirm("Are you sure you want to leave this page? \nAny unsaved changes will be lost.")
			if (!answer) {
				event.preventDefault();
			}
		});*/
		
	}

})();

//BkRIVdsHW