(function () {

	angular
	.module('nativeQDAApp')
	.service('events', events);

	events.$inject = ['$http'];
	function events ($http) {

		var event = function(userInfo){
			return $http.post('/api/event', userInfo);
		};

		return {
			event : event,
		};

	}

})();