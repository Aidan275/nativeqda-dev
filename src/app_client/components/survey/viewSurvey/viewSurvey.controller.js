(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('viewSurveyCtrl', viewSurveyCtrl);

	function viewSurveyCtrl($routeParams, surveyService) {
		var vm = this;
		var accessID = $routeParams.accessID;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		surveyService.readSurvey(accessID)
		.then(function(response) {
			var surveyJSONObj = JSON.parse(response.data.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);
			survey.onComplete.add(function(result) {
				document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
			});

			survey.render("surveyElement");
		});
	}

})();
