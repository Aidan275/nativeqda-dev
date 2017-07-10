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
			saveWatsonAnalysis 		: saveWatsonAnalysis,
			readWatsonAnalysis 		: readWatsonAnalysis,
			listWatsonAnalysis 		: listWatsonAnalysis
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

		function saveWatsonAnalysis(data){
			return $http.post('/api/analysis/watson/save', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(saveWatsonAnalysisComplete)
			.catch(saveWatsonAnalysisFailed);

			function saveWatsonAnalysisComplete(data) { return data; }
			function saveWatsonAnalysisFailed(e) { return exception.catcher('XHR Failed for save watson analysis')(e); }
		};

		function readWatsonAnalysis(id) {
			return $http.get('/api/analysis/watson/read?id=' + id, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(readWatsonAnalysisComplete)
			.catch(readWatsonAnalysisFailed);

			function readWatsonAnalysisComplete(data) { return data; }
			function readWatsonAnalysisFailed(e) { return exception.catcher('XHR Failed for read concept analysis')(e); }
		}

		function listWatsonAnalysis() {
			return $http.get('/api/analysis/watson/list', {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(listWatsonAnalysisComplete)
			.catch(listWatsonAnalysisFailed);

			function listWatsonAnalysisComplete(data) { return data; }
			function listWatsonAnalysisFailed(e) { return exception.catcher('XHR Failed for list concept analysis')(e); }
		}


	}

})();