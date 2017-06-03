(function () {

	angular
	.module('nativeQDAApp')
	.service('events', events);

	events.$inject = ['$http', '$window'];
	function events ($http, $window) {

		event = function(userInfo){
			return $http.post('/api/event', userInfo);
		};

		return {
			event : event,
		};

	}

})();