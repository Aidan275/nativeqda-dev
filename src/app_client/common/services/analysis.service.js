(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('analysisService', analysisService);

	/* @ngInject */
	function analysisService ($http, authentication, exception) {
		return {
			aylienConceptAnalysis	: aylienConceptAnalysis,
			watsonAnalysis			: watsonAnalysis,
			watsonConceptAnalysis 	: watsonConceptAnalysis,
			saveConceptAnalysis 	: saveConceptAnalysis,
			readConceptAnalysis 	: readConceptAnalysis
 		};

		///////////////////////////

		function aylienConceptAnalysis(data){
			return $http.post('/api/analysis/aylien/concept', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(conceptAnalysisComplete)
			.catch(conceptAnalysisFailed);

			function conceptAnalysisComplete(data) { return data; }
			function conceptAnalysisFailed(e) { return exception.catcher('XHR Failed for aylien concept analysis')(e); }
		};

		function watsonAnalysis(data){
			return $http.post('/api/analysis/watson', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(watsonAnalysisComplete)
			.catch(watsonAnalysisFailed);

			function watsonAnalysisComplete(data) { return data; }
			function watsonAnalysisFailed(e) { return exception.catcher('XHR Failed for watson analysis')(e); }
		};

		function watsonConceptAnalysis(data){
			return $http.post('/api/analysis/watson-concept-analysis', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(watsonConceptAnalysisComplete)
			.catch(watsonConceptAnalysisFailed);

			function watsonConceptAnalysisComplete(data) { return data; }
			function watsonConceptAnalysisFailed(e) { return exception.catcher('XHR Failed for Watson Concept Analysis')(e); }
		};

		function saveConceptAnalysis(data) {
			return $http.post('/api/analysis/watson-concept-analysis/save', data, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(saveConceptAnalysisComplete)
			.catch(saveConceptAnalysisFailed);

			function saveConceptAnalysisComplete(data) { return data; }
			function saveConceptAnalysisFailed(e) { return exception.catcher('XHR Failed for save concept analysis')(e); }
		}

		function readConceptAnalysis(id) {
			return $http.get('/api/analysis/watson-concept-analysis/read?id=' + id, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(readConceptAnalysisComplete)
			.catch(readConceptAnalysisFailed);

			function readConceptAnalysisComplete(data) { return data; }
			function readConceptAnalysisFailed(e) { return exception.catcher('XHR Failed for read concept analysis')(e); }
		}



	}

})();