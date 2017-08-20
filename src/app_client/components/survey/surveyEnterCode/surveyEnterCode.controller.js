(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('surveyEnterCodeCtrl', surveyEnterCodeCtrl);

	/* @ngInject */
	function surveyEnterCodeCtrl(logger, surveyService, $location) {
		var vm = this;
		
		vm.pageId = "enter-code-css";

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
			}, function(err){});
		}
	}

})();
