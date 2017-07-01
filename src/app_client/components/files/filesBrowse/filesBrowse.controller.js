(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesBrowseCtrl', filesBrowseCtrl);
	

	/* @ngInject */
	function filesBrowseCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile) {
		var vm = this;

		// Bindable Functions
		vm.viewFile = viewFile;
		vm.confirmDelete = confirmDelete;
		vm.popupFileDetails = popupFileDetails;
		vm.getFileListS3 = getFileListS3;
		vm.pageHeader = {
			title: 'Browse Files'
		};

		// Bindable Data
		vm.fileList = null;

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				listFiles();
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.fileList
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function confirmDelete(key, fileName) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				deleteFileS3(key, fileName);
			}
		}

		function deleteFileS3(key, fileName) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				deleteFileDB(key, fileName);
			});
		}

		function deleteFileDB(key, fileName) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				removeFileFromArray(key);
				logger.success('File ' + fileName + ' deleted successfully', '', 'Success');
			});
		}

		function removeFileFromArray(key) {	
			// Find the marker index for markerId, will return -1 if not found 
			var fileIndex = vm.fileList.findIndex(function(obj){return obj.key === key});

			// Remove the marker from the file list array if found
			if (fileIndex > -1) {
				vm.fileList.splice(fileIndex, 1);
			}

			// Re-list files with the updated file list array
			listFiles();
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetails as vm',
				size: 'lg',
				resolve: {
					key: function () {
						return key;
					}
				}
			});

			modalInstance.result.then(function() {

			});
		}

		// need to work on back end still
		// Thinking if S3 and the DB become unsynced, such as a file in the DB that's 
		// not on S3, or vice-versa, this will re-sync them. Maybe provide settings button
		// to re-sync or do it periodically (maybe when a user logs in?).

		/*
		function syncDB(data) {
			vm.fileList = data.Contents;

			vm.fileList.forEach(function(file) {
				filesService.syncDBwithS3({key: file.Key})
				.then(function(response) {
					console.log(response);
				}, function(err) {
					console.log(err);
				});
			});

			doListFiles(data);
		}
		*/

		// not using at the moment, getting file details from DB 
		// Amazon S3 free tier only provides 2000 put requests and 20000 get requests a month
		function getFileListS3() {
			filesService.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			});
		}
	}

})();