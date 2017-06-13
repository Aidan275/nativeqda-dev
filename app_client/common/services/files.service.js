(function () {

	angular
	.module('nativeQDAApp')
	.service('files', files);

	files.$inject = ['$http', 'authentication'];
	function files ($http, authentication) {

		var signUploadS3 = function(query){
			return $http.post('/api/files/signUploadS3', query, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var signDownloadS3 = function(key){
			return $http.get('/api/files/signDownloadS3?key=' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var getFileListS3 = function(){
			return $http.get('/api/files/getFileListS3', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var deleteFileS3 = function(key){
			return $http.post('/api/files/deleteFileS3', key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var addFileDB = function(fileInfo){
			return $http.post('/api/files/addFileDB', fileInfo, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var getFileListDB = function(){
			return $http.get('/api/files/getFileListDB', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			});
		};

		var deleteFileDB = function(key){
			return $http.delete('/api/files/deleteFileDB?key=' + key, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var syncDBwithS3 = function(key){
			return $http.post('/api/files/syncDBwithS3', key, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		};

		var objectAclS3 = function(objectData) {
			return $http.post('/api/files/objectAclS3', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		}

		var objectAclDB = function(objectData) {
			return $http.post('/api/files/objectAclDB', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			});
		}

		return {
			signUploadS3 : signUploadS3,
			signDownloadS3 : signDownloadS3,
			getFileListS3 : getFileListS3,
			deleteFileS3 : deleteFileS3,
			addFileDB : addFileDB,
			getFileListDB : getFileListDB,
			deleteFileDB : deleteFileDB,
			syncDBwithS3 : syncDBwithS3,
			objectAclS3 : objectAclS3,
			objectAclDB : objectAclDB
		};

	}

})();