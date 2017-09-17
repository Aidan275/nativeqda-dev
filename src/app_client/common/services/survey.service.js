/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc service
* @name services.service:surveyService
* @description Service used for making requests to the
* server to handle servey functions.
*/


(function () {

	'use strict';

	angular
	.module('services')
	.service('surveyService', surveyService);

	/* @ngInject */
	function surveyService ($http, authService, exception) {
		return {
			saveSurvey				: saveSurvey,
			checkSurvey 			: checkSurvey,
			readSurvey				: readSurvey,
			readSurveyJSON 			: readSurveyJSON, 
			listSurveys 			: listSurveys,
			deleteSurvey 			: deleteSurvey,
			saveSurveyResponse 		: saveSurveyResponse,
			readOneSurveyResponse 	: readOneSurveyResponse,
			readSurveyResponses 	: readSurveyResponses
		};

		function saveSurvey(survey){
			return $http.post('/api/survey/save', survey, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(saveSurveyComplete)
			.catch(saveSurveyFailed);

			function saveSurveyComplete(data) { return data.data; }
			function saveSurveyFailed(e) { return exception.catcher('Failed saving survey.')(e); }
		};

		function checkSurvey(accessId){
			// Encode the id for the API URL in case it includes reserved characters (e.g '+', '&')
			var encodedId = encodeURIComponent(accessId);
			return $http.get('/api/survey/check?accessId=' + encodedId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(checkSurveyComplete)
			.catch(checkSurveyFailed);

			function checkSurveyComplete(data) { return data.data; }
			function checkSurveyFailed(e) { return exception.catcher('Failed checking survey.')(e); }
		};

		function readSurvey(accessId){
			// Encode the id for the API URL in case it includes reserved characters (e.g '+', '&')
			var encodedId = encodeURIComponent(accessId);
			return $http.get('/api/survey/read?accessId=' + encodedId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(readSurveyComplete)
			.catch(readSurveyFailed);

			function readSurveyComplete(data) { return data.data; }
			function readSurveyFailed(e) { return exception.catcher('Failed reading survey.')(e); }
		};

		function readSurveyJSON(accessId){
			return $http.get('/api/survey/read/json/' + accessId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(readSurveyJSONComplete)
			.catch(readSurveyJSONFailed);

			function readSurveyJSONComplete(data) { return data.data; }
			function readSurveyJSONFailed(e) { return exception.catcher('Failed reading survey.')(e); }
		};

		function listSurveys(){
			return $http.get('/api/survey/list', {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(listSurveysComplete)
			.catch(listSurveysFailed);

			function listSurveysComplete(data) { return data.data; }
			function listSurveysFailed(e) { return exception.catcher('Failed listing surveys.')(e); }
		};

		function deleteSurvey(id) {
			// Encode the key for the API URL in case it includes reserved characters (e.g '+', '&')
			var encodedId = encodeURIComponent(id);
			return $http.delete('/api/survey/delete?id=' + encodedId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(deleteSurveyComplete)
			.catch(deleteSurveyFailed);

			function deleteSurveyComplete(data) { return data.data; }
			function deleteSurveyFailed(e) { return exception.catcher('Failed deleting survey.')(e); }
		}

		function saveSurveyResponse(response){
			return $http.post('/api/survey/response/save', response, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(saveSurveyResponseComplete)
			.catch(saveSurveyResponseFailed);

			function saveSurveyResponseComplete(data) { return data.data; }
			function saveSurveyResponseFailed(e) { return exception.catcher('Failed saving survey response.')(e); }
		}; 

		function readOneSurveyResponse(accessId, responseId){
			return $http.get('/api/survey/' + accessId + '/response/' + responseId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(readOneSurveyResponseComplete)
			.catch(readOneSurveyResponseFailed);

			function readOneSurveyResponseComplete(data) { return data.data; }
			function readOneSurveyResponseFailed(e) { return exception.catcher('Failed reading survey response.')(e); }
		};

		function readSurveyResponses(accessId){
			// Encode the id for the API URL in case it includes reserved characters (e.g '+', '&')
			var encodedId = encodeURIComponent(accessId);
			return $http.get('/api/survey/responses/read?accessId=' + encodedId, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(readSurveyComplete)
			.catch(readSurveyFailed);

			function readSurveyComplete(data) { return data.data; }
			function readSurveyFailed(e) { return exception.catcher('Failed reading survey response.')(e); }
		};



	}

})();