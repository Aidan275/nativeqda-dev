(function () {

	angular
	.module('nativeQDAApp')
	.service('events', events);

    /* @ngInject */
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