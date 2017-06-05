(function () {

	angular
	.module('nativeQDAApp')
	.service('datasets', datasets);

	datasets.$inject = ['$http', 'authentication'];
	function datasets ($http, authentication) {

		var datasetCreate = function(dataset){
			return $http.post('/api/analysis/data/create', dataset, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var listDatasets = function(datasetList){
			return $http.get('/api/analysis/data', datasetList, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var datasetReadOne = function(datasetid){
			return $http.get('/api/analysis/data/' + datasetid, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var datasetDeleteOne = function(datasetid){
			return $http.delete('/api/analysis/data/delete/' + datasetid, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		return {
			datasetCreate : datasetCreate,
			listDatasets : listDatasets,
			datasetReadOne : datasetReadOne,
			datasetDeleteOne : datasetDeleteOne
		};

	}

})();