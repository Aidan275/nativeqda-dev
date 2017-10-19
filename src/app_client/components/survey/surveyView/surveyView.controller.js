/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name survey.controller:surveyViewCtrl
* @requires $routeParams
* @requires services.service:surveyService
* @description This controller displays a survey given its access Id for a user to preview it.
*/

(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyViewCtrl', surveyViewCtrl);

	/* @ngInject */
	function surveyViewCtrl($routeParams, surveyService) {
		var vm = this;
		var accessId = $routeParams.accessId;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		surveyService.readSurvey(accessId)
		.then(function(data) {
			var surveyJSONObj = JSON.parse(data.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);
			survey.onComplete.add(function(result) {
				document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
			});

			survey.render("surveyElement");
		});
	}

})();
