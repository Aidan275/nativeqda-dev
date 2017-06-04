(function () {

	angular
	.module('nativeQDAApp')
	.service('events', events);

	events.$inject = ['$http'];
	function events ($http) {

		event = function(userInfo){
			return $http.post('/api/event', userInfo);
		};

		return {
			event : event,
		};

	}

})();