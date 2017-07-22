(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('viewResponseCtrl', viewResponseCtrl);

	function viewResponseCtrl($routeParams, surveyService, $filter) {
		var vm = this;
		var accessID = $routeParams.accessID;
		var responseID = $routeParams.responseID;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		activate();

		///////////////////////////

		function activate() {
			loadSurvey();
		}

		function loadSurvey() {
			// Uses the surveyService to make a call to the DB to retrieve the selected survey data (including response) 
			// Might be worth splitting this into two calls, one for fetching the survey and one for fetching the responses.
			surveyService.readSurvey(accessID)
			.then(function(response) {

				// Converts the JSON survey string from the DB to a JS object to display the survey page.
				var surveyJSONObj = JSON.parse(response.data.surveyJSON);

				// Loads the survey object from the DB into the survey library.
				window.survey = new Survey.Model(surveyJSONObj);

				// Event for when the survey is completed... was in the example, probably don't need though for viewing responses
				survey.onComplete.add(function(result) {
					document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
				});

				// display mode so survey is read only
				survey.mode = "display";

				// Gets the survey responses from the DB object returned.
				var surveyResponses = response.data.responses;

				// Finds the selected response by it's ID from the responses array using AngularJS $filter.
				var selectedResponse = $filter('filter')(surveyResponses, {_id: responseID}, true)[0];

				// Converts the JSON response string from the DB to a JS object to display the response data.
				var selectedResponseJSON = JSON.parse(selectedResponse.responseJSON);

				// Sets the data to the selected response data.
				survey.data = selectedResponseJSON;

				// Renders the content to the view.
				survey.render("surveyElement");

			});
		}
	}

})();
