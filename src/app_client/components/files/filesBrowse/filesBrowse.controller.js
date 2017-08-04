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
		vm.newFolder = newFolder;
		vm.openFolder = openFolder;

		// Bindable Data
		vm.fileList = [];
		vm.currentPath = '';
		vm.pathsArray = [''];
		vm.pageHeader = {
			title: 'Browse Files'
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'file-list'});	// Start animated loading overlay
			getFileList();
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			filesService.getFileDB(vm.currentPath)
			.then(function(response) {
				vm.fileList = response.data;
				if(vm.currentPath != '') {
					vm.fileList.push({
						name: '..',
						lastModified: '',
						createdBy: '',
						size: '',
						type: 'parent-dir'
					});
				}
				console.log(vm.currentPath);
				listFiles();
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'file-list'});	// If error, stop animated loading overlay
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.fileList
			});
			bsLoadingOverlayService.stop({referenceId: 'file-list'});	// Stop animated loading overlay
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(name, path, type) {
			if(type === 'folder') {

				if(path === '/') {
					vm.currentPath = name;
				} else {
					vm.currentPath = path + '/' + name;
				}

				vm.pathsArray = vm.currentPath.split("/");
				getFileList();
			} else if (type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				getFileList();
			} else {
				// Open a blank new tab while still in a trusted context to prevent a popup blocker warning
				var newTab = $window.open("about:blank", '_blank')

				// CSS and HTML for loading animation to display while fetching the signed URL
				var loaderHTML = '<style>#loader{position: absolute;left: 50%;top: 50%;border:0.5em solid rgba(70, 118, 250, 0.2);border-radius:50%;'+
				'border-top:0.5em solid #4676fa;width:75px;height:75px;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite;}'+
				'@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}'+
				'@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'+
				'<div id="loader"></div>';

				// Write the loading animation code to the new window
				newTab.document.write(loaderHTML);

				// Make a request to the server for a signed URL to download/view the requested file
				filesService.signDownloadS3(name, path)
				.then(function(response) {
					// Remove the animation 1s after the signed URL is retrieved
					setTimeout(function(){
						newTab.document.getElementById("loader").remove();
					},1000);

					// Redirect the new tab to the signed URL
					// If the file is a document, open in google docs viewer to view in the browser
					if(response.data.type === "document") {
						var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(response.data.url) + '&embedded=true';
						newTab.location = encodedUrl;
					} else {
						// Else either download or view in browser (if natively compatible)
						newTab.location = response.data.url;
					}

				}, function() {
					// If there is an error, close the new tab
					newTab.close();
				});
			}
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
				// (files that were originally text files have the same key for both 
				// key and textFileKey)
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

		function popupFileDetails(filename) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetails as vm',
				size: 'lg',
				resolve: {
					key: function () {
						return filename;
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

		function newFolder() {
			swal({
				title: "New Folder",
				text: "Please enter a name for this folder",
				type: "input",
				confirmButtonColor: "#5cb85c",
				showCancelButton: true,
				closeOnConfirm: false,
				allowOutsideClick: true,
				animation: "slide-from-top",
				inputPlaceholder: "New Folder"
			},
			function(inputValue){
				if (inputValue === false) {
					return false;
				}

				if (inputValue === "") {
					swal.showInputError("You need to write something!");
					return false;
				}

				var folderDetails = {
					name : inputValue,
					path : vm.currentPath,
					type : "folder",
					createdBy : authentication.currentUser().firstName,
					icon : "fa fa-folder-o"
				}
				
				filesService.addFileDB(folderDetails)
				.then(function(response) {
					swal.close();
					console.log(folderDetails.name + ' folder successfully added to DB');
					logger.success(folderDetails.name + ' folder successfully created', '', 'Success');
					vm.fileList.push(response.data);
					listFiles();
				});

				
			});
		}

		function openFolder(index) {
			var newPath = '';

			for(var i = 0; i < index+1; i++) {
				newPath += vm.pathsArray[i];
				if(i!=index) {
					newPath += '/';
				}
			}

			vm.currentPath = newPath;
			vm.pathsArray = vm.currentPath.split("/");
			getFileList();
		}
	}

})();