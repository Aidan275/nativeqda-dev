(function() {

	angular
	.module('nativeQDAApp')
	.service('nativeQDAData', nativeQDAData);

	nativeQDAData.$inject = ['$http', 'authentication'];
	function nativeQDAData ($http, authentication) {
		var locationByCoords = function (lat, lng) {
			return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=200000', {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var locationById = function (locationid) {
			return $http.get('/api/locations/' + locationid, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var addReviewById = function (locationid, data) {
			return $http.post('/api/locations/' + locationid + '/reviews', data, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		return {
			locationByCoords : locationByCoords,
			locationById : locationById,
			addReviewById : addReviewById
		};
	}

})();