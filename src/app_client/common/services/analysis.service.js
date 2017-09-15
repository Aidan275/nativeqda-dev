(function () {

	'use strict';

	angular
	.module('common.services')
	.service('analysisService', analysisService);

	/* @ngInject */
	function analysisService ($http, authentication, exception) {
		return {
			aylienConceptAnalysis	: aylienConceptAnalysis,
			watsonAnalysis			: watsonAnalysis,
			saveWatsonAnalysis 		: saveWatsonAnalysis,
			readWatsonAnalysis 		: readWatsonAnalysis,
			listWatsonAnalysis 		: listWatsonAnalysis,
			deleteWatsonAnalysis 	: deleteWatsonAnalysis,
			watsonTextAnalysis		: watsonTextAnalysis
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
			function conceptAnalysisFailed(e) { return exception.catcher('Failed ALYIEN concept analysis.')(e); }
		};

		function watsonAnalysis(data){
			return $http.post('/api/analysis/watson', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(watsonAnalysisComplete)
			.catch(watsonAnalysisFailed);

			function watsonAnalysisComplete(data) { return data; }
			function watsonAnalysisFailed(e) { return exception.catcher('Failed Watson analysis.')(e); }
		};

		function watsonTextAnalysis(data){
			return $http.post('/api/analysis/watsonText', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(watsonTextAnalysisComplete)
			.catch(watsonTextAnalysisFailed);

			function watsonTextAnalysisComplete(data) { return data; }
			function watsonTextAnalysisFailed(e) { return exception.catcher('Failed Watson analysis.')(e); }
		};

		function saveWatsonAnalysis(data){
			return $http.post('/api/analysis/watson/save', data, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(saveWatsonAnalysisComplete)
			.catch(saveWatsonAnalysisFailed);

			function saveWatsonAnalysisComplete(data) { return data; }
			function saveWatsonAnalysisFailed(e) { return exception.catcher('Failed saving the analysis.')(e); }
		};

		function readWatsonAnalysis(id) {
			return $http.get('/api/analysis/watson/read?id=' + id, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(readWatsonAnalysisComplete)
			.catch(readWatsonAnalysisFailed);

			function readWatsonAnalysisComplete(data) { return data; }
			function readWatsonAnalysisFailed(e) { return exception.catcher('Failed reading the analysis.')(e); }
		}

		function listWatsonAnalysis() {
			return $http.get('/api/analysis/watson/list', {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(listWatsonAnalysisComplete)
			.catch(listWatsonAnalysisFailed);

			function listWatsonAnalysisComplete(data) { return data; }
			function listWatsonAnalysisFailed(e) { return exception.catcher('Failed listing the analyses.')(e); }
		}

		function deleteWatsonAnalysis(analysisID) {
			// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')
            var encodedID = encodeURIComponent(analysisID);
        	return $http.delete('/api/analysis/watson/delete?id=' + encodedID, {
        		headers: {
        			Authorization: 'Bearer '+ authentication.getToken()
        		}
        	}).then(deleteWatsonAnalysisComplete)
        	.catch(deleteWatsonAnalysisFailed);

        	function deleteWatsonAnalysisComplete(data) { return data; }
        	function deleteWatsonAnalysisFailed(e) { return exception.catcher('Failed deleting the analysis.')(e); }
		}

	}

})();