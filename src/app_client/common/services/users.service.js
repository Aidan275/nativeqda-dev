(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('usersService', usersService);

    /* @ngInject */
	function usersService ($http, authentication, exception) {
		return {
			getUserInfo	: getUserInfo
		};

		///////////////////////////

		function getUserInfo(email){
			return $http.get('/api/user/info?email=' + email, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getUserInfoComplete)
			.catch(getUserInfoFailed);

			function getUserInfoComplete(data) { return data; }
			function getUserInfoFailed(e) { return exception.catcher('Failed getting the user\'s info.')(e); }
		};

	}

})();