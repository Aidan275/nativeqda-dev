(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('surveyCompleteCtrl', surveyCompleteCtrl);

	/* @ngInject */
	function surveyCompleteCtrl($routeParams, $location, logger, bsLoadingOverlayService, surveyService, geolocationSvc) {
		var vm = this;

		var accessId = $routeParams.accessId;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.getLocation = getLocation;

		// Bindable Data
		vm.surveyJSON;
		vm.userFormComplete = false;
		vm.surveyComplete = false;
		vm.form;
		vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
		vm.resultButton = null;
		vm.geolocateButtonOptions = { buttonDefaultText: 'Continue', animationCompleteTime: 1000, buttonSubmittingText: 'Finding location...', buttonSuccessText: 'Location Found!' };
		vm.isProcessing = false;

		activate();

		///////////////////////////

		function activate() {
			loadSurvey();
		}

		function loadSurvey() {
			surveyService.readSurveyJSON(accessId)
			.then(function(response) {
				console.log(response);
				vm.surveyJSON = response.data;	/* If loading survey data is successful, store survey to display */
			}, function() {
				$location.path('/complete-survey');	/* If an error occurs loading the survey, return to the complete survey page */
			});
		}
		
		function onSubmit() {
			if(!vm.form.fullName) {
				logger.error('Please enter your full name', '', 'Error');
			} else if (!vm.form.gender) {
				logger.error('Please select your gender', '', 'Error');
			} else if (!vm.form.age) {
				logger.error('Please enter your age', '', 'Error');
			} else {
				vm.userFormComplete = true;		/* To show the actual survey form */
				showSurvey();
			}
		}

		function getLocation() {
			if(vm.form.location) {
				processingEvent(true, null);	/* ng-bs-animated-button status & result */
				geolocationSvc.getCurrentPosition()		/* Using the factory geolicationSvc to geolocate the user */
				.then(saveLocation, 	/* If successful, save the location in local variables */
					function(err) {
						logger.error('Geoloation failed', '', 'Error');
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					});
			}
		}
		
		function saveLocation(position) {
			processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
			vm.form.latitude = position.coords.latitude;	/* Save the location in local variables */
			vm.form.longitude = position.coords.longitude;
		}

		function showSurvey() {
			Survey.Survey.cssType = "bootstrap";
			Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

			var surveyJSONObj = JSON.parse(vm.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);

			survey.onComplete.add(function(result) {
				vm.surveyComplete = true;

				var surveyResponse = {
					fullName: vm.form.fullName,
					email: vm.form.email,
					gender: vm.form.gender,
					age: vm.form.age,
					accessId: accessId,
					responseJSON: JSON.stringify(result.data),
					coords: {
						lat: null,
						lng: null
					}
				};

				if(vm.form.location && vm.form.latitude && vm.form.longitude) {	/* If user allowed location to be used, save the users found location (if a location was found) */
					surveyResponse.coords.lat = vm.form.latitude;
					surveyResponse.coords.lng = vm.form.longitude;
				}

				surveyService.saveSurveyResponse(surveyResponse)	/* Save survey response to the database */
				.then(function(response) {
					logger.success('Survey saved successfully.\nThank you for participating.', '', 'Success');
				});

			});

			survey.render("surveyElement");
			
		}

		/* For the animated submit button and other elements that should be disabled during event processing */
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
			vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */

			vm.isProcessing = status;	/* Processing flag for other view elements to check */
		}
	}

})();
