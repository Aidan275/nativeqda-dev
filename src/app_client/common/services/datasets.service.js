/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc service
* @name services.service:datasetService
* @description Service used for making requests to the
* server to handle dataset functions.
*/

(function () {

	angular
	.module('services')
	.service('datasetService', datasetService);

    /* @ngInject */
	function datasetService ($http, authService, exception) {
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
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(datasetCreateComplete)
        	.catch(datasetCreateFailed);

        	function datasetCreateComplete(data) { return data.data; }
        	function datasetCreateFailed(e) { return exception.catcher('Failed creating the dataset.')(e); }
		};

		function listDatasets(){
			return $http.get('/api/analysis/data/list', {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(listDatasetsComplete)
        	.catch(listDatasetsFailed);

        	function listDatasetsComplete(data) { return data.data; }
        	function listDatasetsFailed(e) { return exception.catcher('Failed listing the datasets.')(e); }
		};

		function datasetReadOne(datasetid){
			return $http.get('/api/analysis/data/read/' + datasetid, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(datasetReadOneComplete)
        	.catch(datasetReadOneFailed);

        	function datasetReadOneComplete(data) { return data.data; }
        	function datasetReadOneFailed(e) { return exception.catcher('Failed reading the dataset.')(e); }
		};

		function deleteDatasetDB(key){
			// Encode the key for the API URL in case it includes reserved characters (e.g '+', '&')
            var encodedKey = encodeURIComponent(key);
			return $http.delete('/api/analysis/data/delete?key=' + encodedKey, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(deleteDatasetDBComplete)
        	.catch(deleteDatasetDBFailed);

        	function deleteDatasetDBComplete(data) { return data.data; }
        	function deleteDatasetDBFailed(e) { return exception.catcher('Failed deleting the dataset from the DB.')(e); }
		};
	}

})();