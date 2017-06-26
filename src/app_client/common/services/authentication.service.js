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

		// Saves a JSON Web Token (JWT) to the browser's local storage
		function saveToken(token) {
			$window.localStorage['nativeQDA-token'] = token;
		};

		// Gets the JWT from the browser's local storage
		function getToken() {
			return $window.localStorage['nativeQDA-token'];
		};

		// Checks if the user is logged in by getting the JWT and checking its expiry date against the current date
		// This FUNCTION can be fooled with a token named 'nativeQDA-token' and a valid expiry date but for any requests 
		// to the server using the APIs, the user's jwt will be checked and denied if not genuine.
		function isLoggedIn() {
			var token = getToken();
			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return payload.exp > Date.now() / 1000;	// Date.now() retrieves the epoch timestamp in milliseconds so must divide by 1000 for seconds
			} else {
				return false;	// Returns false if no token is found
			}
		};

		// Checks if logged in then returns the user's name and email from the JWT
		function currentUser() {
			if(isLoggedIn()){
				var token = getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return {
					email	: payload.email,
					name	: payload.name
				};
			}
		};

		function register(user) {
			return $http.post('/api/register', user)
			.then(registerComplete)
			.catch(registerFailed);

			function registerComplete(data) { saveToken(data.data.token); }
			function registerFailed(e) { return exception.catcher('Registration Failed')(e); }
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