(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('s3Service', s3Service);

	/* @ngInject */
	function s3Service($http, authentication, exception) {
		return {
			signUpload		: signUpload,
			signDownload	: signDownload,
			signDownloadKey	: signDownloadKey,
			deleteFile 		: deleteFile,
			getFileList 	: getFileList,
			updateACL 		: updateACL
		};

		///////////////////////////

		function signUpload(query){
			return $http.post('/api/s3/signUpload', query, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signUploadComplete)
			.catch(signUploadFailed);

			function signUploadComplete(data) { return data; }
			function signUploadFailed(e) { return exception.catcher('Failed signing the S3 upload URL.')(e); }
		};

		function signDownload(filePath, fileName, getTextFile){
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
			}).then(signDownloadComplete)
			.catch(signDownloadFailed);

			function signDownloadComplete(data) { return data; }
			function signDownloadFailed(e) { return exception.catcher('Failed signing the S3 download URL.')(e); }
		};


		function signDownloadKey(key){
			return $http.get('/api/s3/signDownload/' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signDownloadKeyComplete)
			.catch(signDownloadKeyFailed);

			function signDownloadKeyComplete(data) { return data; }
			function signDownloadKeyFailed(e) { return exception.catcher('Failed signing the S3 download URL.')(e); }
		};

		function deleteFile(key){
			return $http.delete('/api/s3/' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(deleteFileComplete)
			.catch(deleteFileFailed);

			function deleteFileComplete(data) { return data; }
			function deleteFileFailed(e) { return exception.catcher('Failed deleting the file from S3.')(e); }
		};

		function getFileList(){
			return $http.get('/api/s3/list', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getFileListComplete)
			.catch(getFileListFailed);

			function getFileListComplete(data) { return data; }
			function getFileListFailed(e) { return exception.catcher('Failed listing the files from S3.')(e); }
		};

		function updateACL(objectData) {
			return $http.post('/api/s3/acl', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(updateACLComplete)
			.catch(updateACLFailed);

			function updateACLComplete(data) { return data; }
			function updateACLFailed(e) { return exception.catcher('Failed updating the file\'s S3 permissions.')(e); }
		}
	}

})();