(function () {

	angular
	.module('nativeQDAApp')
	.service('authentication', authentication);

	authentication.$inject = ['$http', '$window', 'exception'];
	function authentication ($http, $window, exception) {
		return {
			currentUser	: currentUser,
			saveToken	: saveToken,
			getToken	: getToken,
			isLoggedIn	: isLoggedIn,
			register	: register,
			login		: login,
			logout		: logout
		};

		function saveToken(token) {
			$window.localStorage['nativeQDA-token'] = token;
		};

		function getToken() {
			return $window.localStorage['nativeQDA-token'];
		};

		function isLoggedIn() {
			var token = getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		function currentUser() {
			if(isLoggedIn()){
				var token = getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return {
					email : payload.email,
					name : payload.name
				};
			}
		};

		function register(user) {
			return $http.post('/api/register', user).then(function(response){
				saveToken(response.data.token);
			});
		};

		function login(user) {
			return $http.post('/api/login', user)
			.then(loginComplete)
			.catch(loginFailed);

        	function loginComplete(data) { saveToken(data.data.token); }
        	function loginFailed(e) { return exception.catcher('Login Failed')(e); }
		};
		
		function logout(userInfo) {
			$window.localStorage.removeItem('nativeQDA-token');
			return $http.post('/api/event', userInfo);
		};
	}

})();