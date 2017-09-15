(function () {

	'use strict';

	angular
	.module('common.services')
	.service('usersService', usersService);

	/* @ngInject */
	function usersService ($http, authentication, exception) {
		return {
			createUser 		: createUser,
			getUserInfo		: getUserInfo,
			getAllUsersInfo : getAllUsersInfo,
			getAvatar 		: getAvatar,
			updateProfile 	: updateProfile,
			deleteUser 		: deleteUser,
			putUserRole 	: putUserRole
		};

		///////////////////////////

		function createUser(user) {
			return $http.post('/api/user', user, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(createUserComplete)
			.catch(createUserFailed);

			function createUserComplete(data) { return data; }
			function createUserFailed(e) { return exception.catcher('Creating new user failed')(e); }
		}

		function getUserInfo(email){
			return $http.get('/api/user/info?email=' + email, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getUserInfoComplete)
			.catch(getUserInfoFailed);

			function getUserInfoComplete(data) { return data; }
			function getUserInfoFailed(e) { return exception.catcher('Failed getting the user\'s info.')(e); }
		}

		function getAllUsersInfo(){
			return $http.get('/api/users/info', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getAllUsersInfoComplete)
			.catch(getAllUsersInfoFailed);

			function getAllUsersInfoComplete(data) { return data; }
			function getAllUsersInfoFailed(e) { return exception.catcher('Failed getting all user\'s info.')(e); }
		}

		function getAvatar(email){
			return $http.get('/api/user/avatar/' + email, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getAvatarComplete);

			function getAvatarComplete(data) { return data; }
		}

		function updateProfile(userInfo){
			return $http.put('/api/user', userInfo, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(updateProfileComplete)
			.catch(updateProfileFailed);

			function updateProfileComplete(data) { return data; }
			function updateProfileFailed(e) { return exception.catcher('Failed updating the user\'s profile.')(e); }
		}

		function deleteUser(email){
			return $http.delete('/api/user/' + email, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(deleteUserComplete)
			.catch(deleteUserFailed);

			function deleteUserComplete(data) { return data; }
			function deleteUserFailed(e) { return exception.catcher('Failed deleting user\'s profile.')(e); }
		}

		function putUserRole(userInfo) {
			return $http.put('/api/user/' + userInfo.email + '/roles', userInfo, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(putUserRoleComplete)
			.catch(putUserRoleFailed);

			function putUserRoleComplete(data) { return data; }
			function putUserRoleFailed(e) { return exception.catcher('Failed updating user\'s role.')(e); }
		}
		
	}

})();