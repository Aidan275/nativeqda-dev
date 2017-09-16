(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyResponseCtrl', surveyResponseCtrl);

	/* @ngInject */
	function surveyResponseCtrl($routeParams, surveyService, $filter) {
		var vm = this;
		var accessId = $routeParams.accessId;
		var responseId = $routeParams.responseId;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		activate();

		///////////////////////////

		function activate() {
			loadSurvey();
		}

		function loadSurvey() {
			/* Uses the surveyService to make a call to the DB to retrieve the selected survey data (including response) */
			/* Might be worth splitting this into two calls, one for fetching the survey and one for fetching the responses. */
			surveyService.readSurvey(accessId)
			.then(function(response) {

				/* Converts the JSON survey string from the DB to a JS object to display the survey page. */
				var surveyJSONObj = JSON.parse(response.data.surveyJSON);

				/* Loads the survey object from the DB into the survey library. */
				window.survey = new Survey.Model(surveyJSONObj);

				/* Event for when the survey is completed... was in the example, probably don't need though for viewing responses */
				survey.onComplete.add(function(result) {
					document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
				});

				/* display mode so survey is read only */
				survey.mode = "display";

				/* Gets the survey responses from the DB object returned. */
				surveyService.readOneSurveyResponse(accessId, responseId)
				.then(function(response) {

					/* Converts the JSON response string from the DB to a JS object to display the response data. */
					var selectedResponseJSON = JSON.parse(response.data.responseJSON);

					/* Sets the data to the selected response data. */
					survey.data = selectedResponseJSON;

					/* Renders the content to the view. */
					survey.render("surveyElement");
				});

			});
		}
	}

})();
