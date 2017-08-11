(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('filesService', filesService);

	/* @ngInject */
	function filesService ($http, authentication, exception) {
		return {
			signUploadS3	: signUploadS3,
			addFileDB		: addFileDB,
			signDownloadS3	: signDownloadS3,
			getFileListS3	: getFileListS3,
			getFileListDB	: getFileListDB,
			getFileDB       : getFileDB,
			deleteFileS3	: deleteFileS3,
			deleteFileDB	: deleteFileDB,
			fileReadOneDB	: fileReadOneDB,
			objectAclS3		: objectAclS3,
			objectAclDB		: objectAclDB,
			syncDBwithS3	: syncDBwithS3
		};

		///////////////////////////

		function signUploadS3(query){
			return $http.post('/api/s3/signUpload', query, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signUploadS3Complete)
			.catch(signUploadS3Failed);

			function signUploadS3Complete(data) { return data; }
			function signUploadS3Failed(e) { return exception.catcher('Failed signing the S3 upload URL.')(e); }
		};

		function addFileDB(fileInfo){
			if (fileInfo.path == '/') {
				return $http.put('/api/files/' + fileInfo.name, fileInfo, {
					headers: {
						Authorization: 'Bearer ' + authentication.getToken()
					}
				}).then(addFileDBComplete)
				.catch(addFileDBFailed);
			} else {
				return $http.put('/api/files/' + fileInfo.path + '/' + fileInfo.name, fileInfo, {
					headers: {
						Authorization: 'Bearer ' + authentication.getToken()
					}
				}).then(addFileDBComplete)
				.catch(addFileDBFailed);
			}

			function addFileDBComplete(data) { return data; }
			function addFileDBFailed(e) { return exception.catcher('Failed adding the file to the DB.')(e); }
		};

		function signDownloadS3(filePath, fileName, getTextFile){
			/* Encode the key for the API URL incase it includes reserved characters (e.g '+', '&') */
			/* var encodedKey = encodeURIComponent(key); */
			if(!getTextFile){
				getTextFile = 'false';
			}

			if (filePath == '/') {
				var url = '/api/files/' + fileName + '/download?getTextFile=' + getTextFile; /* If getTextFile=true, returns the associated text file for analysis */
			} else {
				var url = '/api/files/' + filePath + '/' + fileName + '/download?getTextFile=' + getTextFile; /* If getTextFile=true, returns the associated text file for analysis */ 
			}

			return $http.get(url, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signDownloadS3Complete)
			.catch(signDownloadS3Failed);

			function signDownloadS3Complete(data) { return data; }
			function signDownloadS3Failed(e) { return exception.catcher('Failed signing the S3 download URL.')(e); }
		};

		function fileReadOneDB(filename){
			var currentpath = ""; /* TODO  */
			return $http.get('/api/files/' + currentpath + filename, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(fileReadOneDBComplete)
			.catch(fileReadOneDBFailed);

			function fileReadOneDBComplete(data) { return data; }
			function fileReadOneDBFailed(e) { return exception.catcher('Failed reading the file form the DB.')(e); }
		};

		function getFileListS3(){
			return $http.get('/api/s3/list', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileListS3Complete)
			.catch(getFileListS3Failed);

			function getFileListS3Complete(data) { return data; }
			function getFileListS3Failed(e) { return exception.catcher('Failed listing the files from S3.')(e); }
		};

		function getFileListDB(getTextFile){
			return $http.get('/api/map/?getTextFile=' + getTextFile, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileListDBComplete)
			.catch(getFileListDBFailed);

			function getFileListDBComplete(data) { return data; }
			function getFileListDBFailed(e) { return exception.catcher('Failed listing the files from the DB.')(e); }
		};

		function getFileDB(filePath, fileName, getTextFile){
			if(!getTextFile){
				getTextFile = 'false';
			}

			if (filePath === '/' && fileName === '') {
				var url = '/api/files/?getTextFile=' + getTextFile; /* If getTextFile=true, returns the associated text file for analysis */
			} else if (fileName === '') {
				var url = '/api/files/' + filePath + '?getTextFile=' + getTextFile; /* If getTextFile=true, returns the associated text file for analysis */ 
			} else {
				var url = '/api/files/' + filePath + '/' + fileName + '?getTextFile=' + getTextFile; /* If getTextFile=true, returns the associated text file for analysis */ 
			}

			return $http.get(url, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileDBComplete)
			.catch(getFileDBFailed);

			function getFileDBComplete(data) { return data; }
			function getFileDBFailed(e) { return exception.catcher('Failed getting the file/folder from the DB.')(e); }
		};

		function deleteFileS3(key){
			return $http.delete('/api/s3/' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(deleteFileS3Complete)
			.catch(deleteFileS3Failed);

			function deleteFileS3Complete(data) { return data; }
			function deleteFileS3Failed(e) { return exception.catcher('Failed deleting the file from S3.')(e); }
		};

		function deleteFileDB(filePath, fileName){
			return $http.delete('/api/files' + filePath + '/' + fileName, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(deleteFileDBComplete)
			.catch(deleteFileDBFailed);

			function deleteFileDBComplete(data) { return data; }
			function deleteFileDBFailed(e) { return exception.catcher('Failed deleting the file from the DB.')(e); }
		};

		function objectAclS3(objectData) {
			return $http.post('/api/s3/acl', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(objectAclS3Complete)
			.catch(objectAclS3Failed);

			function objectAclS3Complete(data) { return data; }
			function objectAclS3Failed(e) { return exception.catcher('Failed changing the file\'s permissions on S3.')(e); }
		}

		function objectAclDB(objectData) {
			return $http.post('/api/files/objectAclDB', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(objectAclDBComplete)
			.catch(objectAclDBFailed);

			function objectAclDBComplete(data) { return data; }
			function objectAclDBFailed(e) { return exception.catcher('Failed changing the file\'s permissions in the DB.')(e); }
		}

		function syncDBwithS3(key){
			return $http.post('/api/s3/syncDB', key, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(syncDBwithS3Complete)
			.catch(syncDBwithS3Failed);

			function syncDBwithS3Complete(data) { return data; }
			function syncDBwithS3Failed(e) { return exception.catcher('Failed syncDBwithS3.')(e); }
		};
	}

})();