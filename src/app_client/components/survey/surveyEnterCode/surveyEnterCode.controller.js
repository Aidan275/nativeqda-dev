/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name survey.controller:surveyEnterCodeCtrl
* @requires $location
* @requires services.service:surveyService
* @requires services.service:logger
* @description This controller checks if a survey code is valid before forwarding the 
* user to the complete survey page, where the survey is displayed. 
*
* The system checks if the IP address of the user has recently completed the given survey, 
* if so, the IP address is locked out from the given survey for 5 minutes to prevent people
* from entering false/inaccurate data multiple times.
*/

(function () {

	'use strict';

	angular
	.module('survey')
	.controller('surveyEnterCodeCtrl', surveyEnterCodeCtrl);

	/* @ngInject */
	function surveyEnterCodeCtrl($location, surveyService, logger) {
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
			.then(function(data) {
				$location.path('/complete-survey/' + surveyCode);
			}, function(err){});
		}
	}

})();
