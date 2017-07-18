(function () {

	angular
	.module('nativeQDAApp')
	.service('surveyService', surveyService);

    /* @ngInject */
	function surveyService ($http, authentication, exception) {
		return {
			saveSurvey	: saveSurvey,
			readSurvey	: readSurvey,
			listSurveys : listSurveys
		};

		function saveSurvey(survey){
			return $http.post('/api/survey/save', survey, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(saveSurveyComplete)
        	.catch(saveSurveyFailed);

        	function saveSurveyComplete(data) { return data; }
        	function saveSurveyFailed(e) { return exception.catcher('Failed saving the survey.')(e); }
		};

		function readSurvey(id){
			// Encode the id for the API URL incase it includes reserved characters (e.g '+', '&')
            var encodedID = encodeURIComponent(id);
			return $http.get('/api/survey/read?id=' + encodedID, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(readSurveyComplete)
        	.catch(readSurveyFailed);

        	function readSurveyComplete(data) { return data; }
        	function readSurveyFailed(e) { return exception.catcher('Failed reading the survey.')(e); }
		};

		function listSurveys(){
			return $http.get('/api/survey/list', {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(listSurveysComplete)
        	.catch(listSurveysFailed);

        	function listSurveysComplete(data) { return data; }
        	function listSurveysFailed(e) { return exception.catcher('Failed listing the surveys.')(e); }
		};
	}

})();