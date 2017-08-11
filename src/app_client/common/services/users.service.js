(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('usersService', usersService);

	/* @ngInject */
	function usersService ($http, authentication, exception) {
		return {
			getUserInfo		: getUserInfo,
			getAllUsersInfo : getAllUsersInfo,
			updateProfile 	: updateProfile,
			getAvatar 		: getAvatar
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

		function getAllUsersInfo(){
			return $http.get('/api/users/info', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getAllUsersInfoComplete)
			.catch(getAllUsersInfoFailed);

			function getAllUsersInfoComplete(data) { return data; }
			function getAllUsersInfoFailed(e) { return exception.catcher('Failed getting all user\'s info.')(e); }
		};

		function updateProfile(userInfo){
			return $http.put('/api/user', userInfo, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(updateProfileComplete)
			.catch(updateProfileFailed);

			function updateProfileComplete(data) { return data; }
			function updateProfileFailed(e) { return exception.catcher('Failed updating the user\'s profile.')(e); }
		};

		function getAvatar(email){
			return $http.get('/api/user/avatar/' + email, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getAvatarComplete);

			function getAvatarComplete(data) { return data; }
		};
	}

})();