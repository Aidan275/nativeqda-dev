(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('surveyEnterCodeCtrl', surveyEnterCodeCtrl);

	/* @ngInject */
	function surveyEnterCodeCtrl(logger, surveyService, $location) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.surveyCode = '';
		vm.surveyFound = false;
		vm.surveyComplete = false;

		///////////////////////////
		
		function onSubmit() {
			if (!vm.surveyCode) {
				logger.error('All fields required, please try again', '', 'Error');
				return false;
			} else {
				var surveyCode = vm.surveyCode;
				checkSurvey(surveyCode);
			}
		};

		function checkSurvey(surveyCode) {
			surveyService.checkSurvey(surveyCode)
			.then(function(response) {
				$location.path('/complete-survey/' + surveyCode);
			});
		}

		function showSurvey(data) {
			Survey.Survey.cssType = "bootstrap";
			Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

			var surveyJSONObj = JSON.parse(data.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);
			survey.onComplete.add(function(result) {
				vm.surveyComplete = true;
				var surveyResponse = {
					accessId: vm.surveyCode,
					responseJSON: JSON.stringify(result.data)
				};

				surveyService.saveSurveyResponse(surveyResponse)
				.then(function(response) {
					logger.success('Survey saved successfully.\nThank you for participating.', '', 'Success');
				});
			});

			survey.render("surveyElement");
			
		}

	}

})();
