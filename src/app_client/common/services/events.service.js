(function () {

	angular
	.module('nativeQDAApp')
	.service('events', events);

	events.$inject = ['$http'];
	function events ($http) {
		return {
			event: event
		};

		///////////////////////////

		function event(userInfo){
			return $http.post('/api/event', userInfo);
		};
	}

})();