(function () {

	angular
	.module('nativeQDAApp')
	.service('authentication', authentication);

	/* @ngInject */
	function authentication ($http, $window, exception, $location) {
		return {
			currentUser		: currentUser,
			saveToken		: saveToken,
			getToken		: getToken,
			isLoggedIn		: isLoggedIn,
			lastModified 	: lastModified,
			register		: register,
			login			: login,
			logout			: logout,
			setavatar		: setavatar 
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

				if(payload.exp < Date.now() / 1000) {	/* Checks if the token has expired */
					swal({
						title: "You have been logged out",
						text: "Your security token has expired, please login again to continue",
						type: "warning",
						confirmButtonColor: "#d9534f",
						confirmButtonText: "Okay"
					},
					function() {
						logout();	
						$location.path('/login');
						return false;
					});					
				} else {
					lastModified().then(function(response) {		/* Checks if the database for the date/time the user profile was last modified */
						var date = new Date(response.data.lastModified);
						var lastModifiedTime = parseInt(date.getTime() / 1000);	/* Checks the date/time the users token was created */
						if(lastModifiedTime > payload.iat) {		/* If the token was created before the last modified date of the user profile display message and logout */
							swal({
								title: "You have been logged out",
								text: "Your security token is not up to date, please login again to continue",
								type: "warning",
								confirmButtonColor: "#d9534f",
								confirmButtonText: "Okay"
							},
							function() {
								logout();	
								$location.path('/login');
								return false;
							});							
						}
					});
				}

				return true;	// If token has not expired or been modified, return true
			} else {
				return false;	// Returns false if no token is found
			}
		};

		function lastModified(){
			return $http.get('/api/user/last-modified', {
				headers: {
					Authorization: 'Bearer ' + getToken()
				}
			}).then(lastModifiedComplete)
			.catch(lastModifiedFailed);

			function lastModifiedComplete(data) { return data; }
			function lastModifiedFailed(e) { return exception.catcher('Failed getting the user\'s last modified date.')(e); }
		};

		// Checks if logged in then returns the user's firstName and email from the JWT
		function currentUser() {
			if(isLoggedIn()){
				var token = getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return {
					email		: payload.email,
					firstName	: payload.firstName,
					settings 	: payload.settings,
					avatar 		: payload.avatar,
					iat			: payload.iat
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
		
		function setavatar(newavatarurl) {
			return $http.post('/api/user/setavatar');
		};
	}

})();