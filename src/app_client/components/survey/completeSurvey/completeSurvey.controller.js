(function () {

	angular
	.module('nativeQDAApp')
	.controller('CompleteSurveyCtrl', CompleteSurveyCtrl);

	/* @ngInject */
	function CompleteSurveyCtrl(logger, bsLoadingOverlayService, surveyService) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.surveyCode = '';
		vm.surveyFound = false;

		///////////////////////////
		
		function onSubmit() {
			if (!vm.surveyCode) {
				logger.error('All fields required, please try again', '', 'Error');
				return false;
			} else {
				var surveyCode = vm.surveyCode;
				getSurvey(surveyCode);
			}
		};

		function getSurvey(surveyCode) {
			surveyService.readSurvey(surveyCode)
			.then(function(response) {
				vm.surveyFound = true;
				showSurvey(response.data);
			})
		}

		function showSurvey(data) {
			console.log(data);
			Survey.Survey.cssType = "bootstrap";
			Survey.defaultBootstrapCss.navigationButton = "btn btn-green";

			var surveyJSONObj = JSON.parse(data.surveyJSON);
			window.survey = new Survey.Model(surveyJSONObj);
			survey.onComplete.add(function(result) {
				document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
			});

			survey.render("surveyElement");
			
		}

	}

})();
