/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc service
* @name services.service:filesService
* @description Service used for making requests to the
* server to handle file functions.
*/

(function () {

	'use strict';

	angular
	.module('services')
	.service('filesService', filesService);

	/* @ngInject */
	function filesService($http, authService, exception) {
		return {
			addFile			: addFile,
			getFileList		: getFileList,
			getFile			: getFile,
			deleteFile		: deleteFile,
			fileReadOne		: fileReadOne,
			updateACL		: updateACL,
			syncDBwithS3	: syncDBwithS3,
			downloadFile	: downloadFile
		};

		///////////////////////////

		function addFile(fileInfo){
			if (fileInfo.path == '/') {
				return $http.put('/api/files/' + fileInfo.name, fileInfo, {
					headers: {
						Authorization: 'Bearer ' + authService.getToken()
					}
				}).then(addFileComplete)
				.catch(addFileFailed);
			} else {
				return $http.put('/api/files/' + fileInfo.path + '/' + fileInfo.name, fileInfo, {
					headers: {
						Authorization: 'Bearer ' + authService.getToken()
					}
				}).then(addFileComplete)
				.catch(addFileFailed);
			}

			function addFileComplete(data) { return data.data; }
			function addFileFailed(e) { return exception.catcher('Failed adding the file to the database.')(e); }
		};

		function fileReadOne(filename){
			var currentpath = ""; /* TODO  */
			return $http.get('/api/files/' + currentpath + filename, {
				headers: {
					Authorization: 'Bearer ' + authService.getToken()
				}
			}).then(fileReadOneComplete)
			.catch(fileReadOneFailed);

			function fileReadOneComplete(data) { return data.data; }
			function fileReadOneFailed(e) { return exception.catcher('Failed reading the file form the database.')(e); }
		};

		function getFileList(getTextFile){
			return $http.get('/api/map/?getTextFile=' + getTextFile, {
				headers: {
					Authorization: 'Bearer ' + authService.getToken()
				}
			}).then(getFileListComplete)
			.catch(getFileListFailed);

			function getFileListComplete(data) { return data.data; }
			function getFileListFailed(e) { return exception.catcher('Failed listing the files from the database.')(e); }
		};

		function getFile(filePath, fileName, getTextFile){
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
					Authorization: 'Bearer ' + authService.getToken()
				}
			}).then(getFileComplete)
			.catch(getFileFailed);

			function getFileComplete(data) { return data.data; }
			function getFileFailed(e) { return exception.catcher('Failed getting the file/folder from the database.')(e); }
		};

		function deleteFile(filePath, fileName){
			return $http.delete('/api/files/' + filePath + '/' + fileName, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(deleteFileComplete)
			.catch(deleteFileFailed);

			function deleteFileComplete(data) { return data.data; }
			function deleteFileFailed(e) { return exception.catcher('Failed deleting the file from the database.')(e); }
		};

		function updateACL(aclObject) {
			return $http.post('/api/files/acl', aclObject, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(updateACLComplete)
			.catch(updateACLFailed);

			function updateACLComplete(data) { return data.data; }
			function updateACLFailed(e) { return exception.catcher('Failed changing the file\'s permissions in the database.')(e); }
		}

		function syncDBwithS3(key){
			return $http.post('/api/s3/syncDB', key, {
				headers: {
					Authorization: 'Bearer '+ authService.getToken()
				}
			}).then(syncDBwithS3Complete)
			.catch(syncDBwithS3Failed);

			function syncDBwithS3Complete(data) { return data.data; }
			function syncDBwithS3Failed(e) { return exception.catcher('Failed syncDBwithS3.')(e); }
		};

		function downloadFile(url){
			return $http.get(url)
			.then(downloadFileComplete)
			.catch(downloadFileFailed);

			function downloadFileComplete(data) { return data.data; }
			function downloadFileFailed(e) { return exception.catcher('Failed downloading file.')(e); }
		};
	}

})();