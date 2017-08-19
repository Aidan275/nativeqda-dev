(function () {

	angular
	.module('nativeQDAApp')
	.service('authentication', authentication);

	/* @ngInject */
	function authentication($rootScope, $http, $window, exception, $location) {
		return {
			register		: register,
			login			: login,
			saveToken		: saveToken,
			getToken		: getToken,
			logout			: logout,
			forgotPassword 	: forgotPassword,
			resetPassword 	: resetPassword,
			isLoggedIn		: isLoggedIn,
			currentUser		: currentUser,
			checkJWT 		: checkJWT,
			lastModified 	: lastModified
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
		/* Saves a JSON Web Token (JWT) to the browser's local storage */
		function saveToken(token) {
			$window.localStorage['nativeQDA-token'] = token;
		};

		/* Gets the JWT from the browser's local storage */
		function getToken() {
			return $window.localStorage['nativeQDA-token'];
		};

		function logout(userInfo) {
			$window.localStorage.removeItem('nativeQDA-token');
		};

		function forgotPassword(email) {
			return $http.post('/api/password/forgot/', email)
			.then(forgotPasswordComplete)
			.catch(forgotPasswordFailed);

			function forgotPasswordComplete(data) { return data; }
			function forgotPasswordFailed(e) { return exception.catcher('Forgot Password Failed')(e); }
		};

		function resetPassword(credentials) {
			return $http.post('/api/password/reset/', credentials)
			.then(resetPasswordComplete)
			.catch(resetPasswordFailed);

			function resetPasswordComplete(data) { return data; }
			function resetPasswordFailed(e) { return exception.catcher('Reset Password Failed')(e); }
		};

		/* Checks if the user is logged in by getting the JWT and checking its expiry date against the current date */
		/* This FUNCTION can be fooled with a token named 'nativeQDA-token' and a valid expiry date but for any requests */
		/* to the server using the APIs, the user's jwt will be checked and denied if not genuine. */
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
				} 
				return true;	/* If token has not expired, return true */
			} else {
				return false;	/* Returns false if no token is found */
			}
		}

		// Checks if logged in then returns the user's firstName and email from the JWT
		function currentUser() {
			if(isLoggedIn()){
				var token = getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return {
					_id 		: payload._id,
					email		: payload.email,
					firstName	: payload.firstName,
					settings 	: payload.settings,
					avatar 		: payload.avatar,
					iat			: payload.iat
				};
			}
		}

		function checkJWT() {
			var token = getToken();
			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				lastModified()
				.then(function(response) {		/* Checks the database for the date/time the user profile was last modified */
					var date = new Date(response.data.lastModified);
					var lastModifiedTime = parseInt(date.getTime() / 1000);	/* Checks the date/time the user's token was created */
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
							$location.path('/login');	/* Go to the login page */
							$rootScope.$apply();		/* Perform a digest cycle to reflect page change */	
							return false;
						});							
					}
				});
			}
		}

		/* Gets the date the users profile was last modified for comparison against the users token */
		/* At the moment the date is checked on every route change (in app_client/app.js). */
		/* This could probably be done more efficiently and be checked on every request to the server */
		/* Saving the browser from having to make excessive requests to the server */
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
	}

})();