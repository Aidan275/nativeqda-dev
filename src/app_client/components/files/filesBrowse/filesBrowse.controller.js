(function () { 

	'use strict';

	angular
	.module('files')
	.controller('filesBrowseCtrl', filesBrowseCtrl);
	

	/* @ngInject */
	function filesBrowseCtrl (mapService, $http, $window, $routeParams, $location, $scope, $uibModal, Upload, NgTableParams, filesService, authService, logger, $filter, $compile, bsLoadingOverlayService, s3Service) {
		var vm = this;
		
		vm.pageId = 'file-browser-css'
		
		// Bindable Functions
		vm.viewFile = viewFile;
		vm.confirmDelete = confirmDelete;
		vm.popupFileDetails = popupFileDetails;
		vm.getFileListS3 = getFileListS3;
		vm.popupUploadFile = popupUploadFile;
		vm.newFolder = newFolder;
		vm.openFolder = openFolder;

		// Bindable Data
		vm.fileList = [];
		vm.currentPath = fileroute($routeParams['folder'], $routeParams['file']);
		vm.pathsArray = vm.currentPath.split("/");
		vm.pageHeader = {
			title: 'Files'
		};

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}
		
		//Manage router parameters
		function fileroute(folder, file) {
			//console.log(folder + " " + file)
			if (folder == null && file == null) //Root
				return '';
			else if (folder == null) //Root-level folder/file
				return file;
			else //Otherwise
				return folder + '/' + file
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			bsLoadingOverlayService.start({referenceId: 'file-list'});	// Start animated loading overlay
			filesService.getFile(vm.currentPath, '')
			.then(function(data) {

				vm.fileList = [];	/* reset fileList array on folder navigation */

				if(vm.currentPath != '') {	/* If not in the root folder, add a parent directory link */
					vm.fileList.push({
						name: '..',
						lastModified: '',
						createdBy: '',
						size: '',
						type: 'parent-dir',
						typeOrder: 0	/* For sorting by parent directory, folder, file */
					});
				}

				data.forEach(function(file) {	/* Add each file to the fileList array */
					if(file.type === 'folder') {
						file.typeOrder = 1;	/* For sorting by parent directory, folder, file */
					} else {
						file.typeOrder = 2;	/* For sorting by parent directory, folder, file */
					}
					vm.fileList.push(file);
				});
				listFiles();	/* List files in the view using ng-table */
				console.log(vm.currentPath);
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'file-list'});	// If error, stop animated loading overlay
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {typeOrder: "asc", lastModified: "desc"}	/* For sorting by parent directory, folder, file then by last modified date */
			}, {
				dataset: vm.fileList
			});
			bsLoadingOverlayService.stop({referenceId: 'file-list'});	// Stop animated loading overlay
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(file) {
			//Check file type and path
			if(file.type === 'folder') {
				if(file.path === '/') {
					vm.currentPath = file.name;
				} else {
					//If path already exists, concatenate the filename on the end
					vm.currentPath = file.path + '/' + file.name;
				}

				vm.pathsArray = vm.currentPath.split("/");
				$location.path("files/" + vm.currentPath) //Update URL
			} else if (file.type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				$location.path("files/" + vm.currentPath) //Update URL
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
				s3Service.signDownload(file.path, file.name)
				.then(function(data) {
					// Remove the animation 1s after the signed URL is retrieved
					setTimeout(function(){
						newTab.document.getElementById("loader").remove();
					},1000);

					// Redirect the new tab to the signed URL
					// If the file is a document, open in google docs viewer to view in the browser
					if(data.type === "doc") {
						var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(data.url) + '&embedded=true';
						newTab.location = encodedUrl;
					} else {
						// Else either download or view in browser (if natively compatible)
						newTab.location = data.url;
					}

				}, function() {
					// If there is an error, close the new tab
					newTab.close();
				});
			}
		}

		function confirmDelete(file) {
			swal({
				title: "Are you sure?",
				html: true,
				text: "<p>Confirm to delete the file '<strong>" + file.name + "</strong>'</p>",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				closeOnConfirm: false,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				if(file.analyses.length > 0) {
					swal({
						title: "Are you positive?",
						html: true,
						text: "<p>'<strong>" + file.name + "</strong>' is included in an analysis, are you still sure you want to delete this file?</p><br /><p>The analysis results will still be available.</p>",
						type: "warning",
						showCancelButton: true,
						allowOutsideClick: true,
						confirmButtonColor: "#d9534f",
						confirmButtonText: "Yes! delete it!"
					}, function() {
						deleteFile(file);
					});
				} else {
					deleteFile(file);
					swal.close();
				}
			
			});
		}

		function deleteFile(file) {
			filesService.deleteFile(file.path, file.name)
			.then(function(data) {
				if(file.type != 'folder') {	/* If the file is not a folder, delete from S3 too */
					s3Service.deleteFile(file.key)
					.then(function(data) {
						/* If a text file was generated for analysis, delete that file too. If the original file was a text file, just */
						/* delete that file (files that were originally text files have the same key for both key and textFileKey) */
						if(file.textFileKey && file.textFileKey != file.key){
							s3Service.deleteFile(file.textFileKey);
						}
						removeFileFromArray(file._id);
						logger.success("'" + file.name + "' was deleted successfully", "", "Success");
					});
				} else {	/* Else if the file is a folder, only need to remove from the database */
					removeFileFromArray(file._id);
					logger.success("'" + file.name + "' was deleted successfully", "", "Success");
				}					
			});
		}

		function removeFileFromArray(id) {	
			// Find the index for the file, will return -1 if not found 
			var fileIndex = vm.fileList.findIndex(function(obj){return obj._id === id});

			// Remove the file from the file list array if found
			if (fileIndex > -1) {
				vm.fileList.splice(fileIndex, 1);
			}

			// Re-list files with the updated file list array
			listFiles();
		}

		function popupFileDetails(file) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetailsCtrl as vm',
				size: 'lg',
				resolve: {
					file: function() {
						return file;
					}
				}
			});
			modalInstance.result.then(function() {
				removeFileFromArray(file._id);
			}, function(){});
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
				.then(function(data) {
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
			s3Service.getFileList()
			.then(function(data) {
				//syncDB(data);
				doListFilesS3(data.Contents);
			});
		}

		function popupUploadFile() {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/filesUpload/filesUpload.view.html',
				controller: 'filesUploadCtrl as vm',
				size: 'xl',
				backdrop: 'static',	/* disables modal closing by click on the backdrop */
				openedClass: 'upload-modal',	/* Class added to the body element when the modal is opened */
				resolve: {
					currentPath: function () {
						return vm.currentPath;
					}
				}
			});

			modalInstance.rendered.then(function() {

			});

			modalInstance.result.then(function(newFile) {
				newFile.typeOrder = 2;	/* For sorting by parent directory, folder, file */
				vm.fileList.push(newFile);
				listFiles();
			}, function(e){

			});
		}

		function newFolder() {
			swal({
				title: "New Folder",
				text: "Please enter a name for this folder",
				type: "input",
				confirmButtonColor: "var(--main-colour)",
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
					createdBy : authService.currentUser().firstName,
					icon : "fa fa-folder-o"
				}

				filesService.addFile(folderDetails)
				.then(function(data) {
					swal.close();
					logger.success(folderDetails.name + ' folder successfully created', '', 'Success');
					data.typeOrder = 1;
					vm.fileList.push(data);
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
			//vm.pathsArray = vm.currentPath.split("/");
			$location.path("files/" + newPath) //Update URL
		}
	}

})();