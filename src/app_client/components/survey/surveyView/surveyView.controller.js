(function () {

	'use strict';

	angular
	.module('components.survey')
	.controller('surveyViewCtrl', surveyViewCtrl);

	/* @ngInject */
	function surveyViewCtrl($routeParams, surveyService) {
		var vm = this;
		var accessId = $routeParams.accessId;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		surveyService.readSurvey(accessId)
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
