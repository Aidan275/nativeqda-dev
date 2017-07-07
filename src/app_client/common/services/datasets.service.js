(function () {

	angular
	.module('nativeQDAApp')
	.service('datasetService', datasetService);

    /* @ngInject */
	function datasetService ($http, authentication, exception) {
		return {
			datasetCreate	: datasetCreate,
			listDatasets	: listDatasets,
			datasetReadOne	: datasetReadOne,
			deleteDatasetDB	: deleteDatasetDB
		};

		// Creates a dataset with a name and dexcription
		function datasetCreate(dataset){
			return $http.post('/api/analysis/data/create', dataset, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(datasetCreateComplete)
        	.catch(datasetCreateFailed);

        	function datasetCreateComplete(data) { return data; }
        	function datasetCreateFailed(e) { return exception.catcher('XHR Failed for datasetCreate')(e); }
		};

		function listDatasets(){
			return $http.get('/api/analysis/data/list', {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(listDatasetsComplete)
        	.catch(listDatasetsFailed);

        	function listDatasetsComplete(data) { return data; }
        	function listDatasetsFailed(e) { return exception.catcher('XHR Failed for listDatasets')(e); }
		};

		function datasetReadOne(datasetid){
			return $http.get('/api/analysis/data/read/' + datasetid, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(datasetReadOneComplete)
        	.catch(datasetReadOneFailed);

        	function datasetReadOneComplete(data) { return data; }
        	function datasetReadOneFailed(e) { return exception.catcher('XHR Failed for datasetReadOne')(e); }
		};

		function deleteDatasetDB(key){
			// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')
            var encodedKey = encodeURIComponent(key);
			return $http.delete('/api/analysis/data/delete?key=' + encodedKey, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(deleteDatasetDBComplete)
        	.catch(deleteDatasetDBFailed);

        	function deleteDatasetDBComplete(data) { return data; }
        	function deleteDatasetDBFailed(e) { return exception.catcher('XHR Failed for deleteDatasetDB')(e); }
		};
	}

})();