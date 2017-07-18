(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewSurveyCtrl', viewSurveyCtrl);

	function viewSurveyCtrl($routeParams, surveyService) {
		var vm = this;

		var id = $routeParams.id;

		Survey.Survey.cssType = "bootstrap";
		Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

		surveyService.readSurvey(id)
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
