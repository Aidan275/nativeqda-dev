(function () {

	angular
	.module('nativeQDAApp')
	.service('authentication', authentication);

	authentication.$inject = ['$http', '$window'];
	function authentication ($http, $window) {

		var saveToken = function (token) {
			$window.localStorage['nativeQDA-token'] = token;
		};

		var getToken = function () {
			return $window.localStorage['nativeQDA-token'];
		};

		var isLoggedIn = function() {
			var token = getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		var currentUser = function() {
			if(isLoggedIn()){
				var token = getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return {
					email : payload.email,
					name : payload.name
				};
			}
		};

		register = function(user) {
			return $http.post('/api/register', user).then(function(response){
				saveToken(response.data.token);
			});
		};

		login = function(user) {
			return $http.post('/api/login', user).then(function (response) {
				saveToken(response.data.token);
			});
		};
		
		logout = function() {
			$window.localStorage.removeItem('nativeQDA-token');
		};

		return {
			currentUser : currentUser,
			saveToken : saveToken,
			getToken : getToken,
			isLoggedIn : isLoggedIn,
			register : register,
			login : login,
			logout : logout
		};
	}


})();