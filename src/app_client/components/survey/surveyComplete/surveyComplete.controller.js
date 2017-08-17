(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('surveyCompleteCtrl', surveyCompleteCtrl);

	/* @ngInject */
	function surveyCompleteCtrl($routeParams, logger, bsLoadingOverlayService, surveyService) {
		var vm = this;

		var accessId = $routeParams.accessId;

		// Bindable Functions


		// Bindable Data
		vm.surveyComplete = false;

		activate();

		///////////////////////////
		
		function activate() {
			loadSurvey();
		}

		function loadSurvey() {
			surveyService.readSurvey(accessId)
			.then(function(response) {
				showSurvey(response.data);
			});
		}

		function showSurvey(surveyData) {
			Survey.Survey.cssType = "bootstrap";
			Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

			var surveyJSONObj = JSON.parse(surveyData.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);

			survey.onComplete.add(function(result) {
				vm.surveyComplete = true;

				var surveyResponse = {
					accessId: accessId,
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
