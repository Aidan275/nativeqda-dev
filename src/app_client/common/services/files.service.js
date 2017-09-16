/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
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
	function filesService($http, authentication, exception) {
		return {
			addFileDB		: addFileDB,
			getFileListDB	: getFileListDB,
			getFileDB       : getFileDB,
			deleteFileDB	: deleteFileDB,
			fileReadOneDB	: fileReadOneDB,
			updateACL		: updateACL,
			syncDBwithS3	: syncDBwithS3,
			downloadFile 	: downloadFile
		};

		///////////////////////////

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

		function deleteFileDB(filePath, fileName){
			return $http.delete('/api/files/' + filePath + '/' + fileName, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(deleteFileDBComplete)
			.catch(deleteFileDBFailed);

			function deleteFileDBComplete(data) { return data; }
			function deleteFileDBFailed(e) { return exception.catcher('Failed deleting the file from the DB.')(e); }
		};

		function updateACL(objectData) {
			return $http.post('/api/files/objectAclDB', objectData, {
				headers: {
					Authorization: 'Bearer '+ authentication.getToken()
				}
			}).then(updateACLComplete)
			.catch(updateACLFailed);

			function updateACLComplete(data) { return data; }
			function updateACLFailed(e) { return exception.catcher('Failed changing the file\'s permissions in the DB.')(e); }
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

		function downloadFile(url){
			return $http.get(url)
			.then(downloadFileComplete)
			.catch(downloadFileFailed);

			function downloadFileComplete(data) { return data; }
			function downloadFileFailed(e) { return exception.catcher('Failed downloading file.')(e); }
		};
	}

})();