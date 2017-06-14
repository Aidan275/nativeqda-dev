(function () {

    'use strict';

	angular
	.module('nativeQDAApp')
	.service('filesService', filesService);

	filesService.$inject = ['$http', 'authentication', 'exception'];
	function filesService ($http, authentication, exception) {
		return {
			signUploadS3	: signUploadS3,
			signDownloadS3	: signDownloadS3,
			getFileListS3	: getFileListS3,
			deleteFileS3	: deleteFileS3,
			addFileDB		: addFileDB,
			getFileListDB	: getFileListDB,
			fileReadOneDB	: fileReadOneDB,
			deleteFileDB	: deleteFileDB,
			syncDBwithS3	: syncDBwithS3,
			objectAclS3		: objectAclS3,
			objectAclDB		: objectAclDB
		};

        ///////////////////////////

		function signUploadS3(query){
			return $http.post('/api/files/signUploadS3', query, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signUploadS3Complete)
			.catch(signUploadS3Failed);

			function signUploadS3Complete(data) { return data; }
			function signUploadS3Failed(e) { return exception.catcher('XHR Failed for signUploadS3')(e); }
		};

		function signDownloadS3(key){
			return $http.get('/api/files/signDownloadS3?key=' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signDownloadS3Complete)
			.catch(signDownloadS3Failed);

			function signDownloadS3Complete(data) { return data; }
			function signDownloadS3Failed(e) { return exception.catcher('XHR Failed for signDownloadS3')(e); }
		};

		function getFileListS3(){
			return $http.get('/api/files/getFileListS3', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileListS3Complete)
			.catch(getFileListS3Failed);

			function getFileListS3Complete(data) { return data; }
			function getFileListS3Failed(e) { return exception.catcher('XHR Failed for getFileListS3')(e); }
		};

		function deleteFileS3(key){
			return $http.post('/api/files/deleteFileS3', key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(deleteFileS3Complete)
			.catch(deleteFileS3Failed);

			function deleteFileS3Complete(data) { return data; }
			function deleteFileS3Failed(e) { return exception.catcher('XHR Failed for deleteFileS3')(e); }
		};

		function addFileDB(fileInfo){
			return $http.post('/api/files/addFileDB', fileInfo, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(addFileDBComplete)
			.catch(addFileDBFailed);

			function addFileDBComplete(data) { return data; }
			function addFileDBFailed(e) { return exception.catcher('XHR Failed for addFileDB')(e); }
		};

		function getFileListDB(){
			return $http.get('/api/files/getFileListDB', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileListDBComplete)
			.catch(getFileListDBFailed);

			function getFileListDBComplete(data) { return data; }
			function getFileListDBFailed(e) { return exception.catcher('XHR Failed for getFileListDB')(e); }
		};

		function fileReadOneDB(key){
			return $http.get('/api/files/fileReadOneDB?key=' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(fileReadOneDBComplete)
			.catch(fileReadOneDBFailed);

			function fileReadOneDBComplete(data) { return data; }
			function fileReadOneDBFailed(e) { return exception.catcher('XHR Failed for fileReadOneDB')(e); }
		};
		
		function deleteFileDB(key){
			return $http.delete('/api/files/deleteFileDB?key=' + key, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(deleteFileDBComplete)
			.catch(deleteFileDBFailed);

			function deleteFileDBComplete(data) { return data; }
			function deleteFileDBFailed(e) { return exception.catcher('XHR Failed for deleteFileDB')(e); }
		};

		function syncDBwithS3(key){
			return $http.post('/api/files/syncDBwithS3', key, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(syncDBwithS3Complete)
			.catch(syncDBwithS3Failed);

			function syncDBwithS3Complete(data) { return data; }
			function syncDBwithS3Failed(e) { return exception.catcher('XHR Failed for syncDBwithS3')(e); }
		};

		function objectAclS3(objectData) {
			return $http.post('/api/files/objectAclS3', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(objectAclS3Complete)
			.catch(objectAclS3Failed);

			function objectAclS3Complete(data) { return data; }
			function objectAclS3Failed(e) { return exception.catcher('XHR Failed for objectAclS3')(e); }
		}

		function objectAclDB(objectData) {
			return $http.post('/api/files/objectAclDB', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(objectAclDBComplete)
			.catch(objectAclDBFailed);

			function objectAclDBComplete(data) { return data; }
			function objectAclDBFailed(e) { return exception.catcher('XHR Failed for objectAclDB')(e); }
		}
	}
})();