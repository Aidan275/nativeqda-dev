(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesBrowseCtrl', filesBrowseCtrl);
	

	/* @ngInject */
	function filesBrowseCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile, bsLoadingOverlayService) {
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

		// Gets all the files from the MongoDB database
		function getFileList() {
			bsLoadingOverlayService.start({referenceId: 'file-list'});
			filesService.getFileListDB()
			.then(function(response) {
				setTimeout(function(){ 
					bsLoadingOverlayService.stop({referenceId: 'file-list'});
					vm.fileList = response.data;
					listFiles();
				}, 3000);
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

		function confirmDelete(key, fileName, textFileKey) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the file '" + fileName + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteFileDB(key, fileName, textFileKey);
			});
		}

		function deleteFileDB(key, fileName, textFileKey) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(key, fileName, textFileKey);
			});
		}

		function deleteFileS3(key, fileName, textFileKey) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				// If a text file was generated for analysis, delete that file too.
				// If the original file was a text file, just delete that file
				if(textFileKey && textFileKey != key){
					filesService.deleteFileS3({key: textFileKey});
				}
				removeFileFromArray(key);
				logger.success("'" + fileName + "' was deleted successfully", "", "Success");
			});
		}

		function removeFileFromArray(key) {	
			// Find the index for the file, will return -1 if not found 
			var fileIndex = vm.fileList.findIndex(function(obj){return obj.key === key});

			// Remove the file from the file list array if found
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