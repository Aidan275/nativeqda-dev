(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('analysisService', analysisService);

	analysisService.$inject = ['$http', 'authentication', 'exception'];
	function analysisService ($http, authentication, exception) {
		return {
			conceptAnalysis	: conceptAnalysis
		};

        ///////////////////////////

        function conceptAnalysis(data){
        	return $http.post('/api/analysis/concept', data, {
        		headers: {
        			Authorization: 'Bearer ' + authentication.getToken()
        		}
        	}).then(conceptAnalysisComplete)
        	.catch(conceptAnalysisFailed);

        	function conceptAnalysisComplete(data) { return data; }
        	function conceptAnalysisFailed(e) { return exception.catcher('XHR Failed for concept analysis')(e); }
        };
    }

})();