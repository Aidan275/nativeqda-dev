(function () {

	'use strict';

	angular
	.module('files')
	.controller('newDatasetCtrl', newDatasetCtrl);

	/* @ngInject */
	function newDatasetCtrl($scope, $http, $uibModalInstance, datasetService, filesService, logger, NgTableParams, $window, Upload, authentication, bsLoadingOverlayService, s3Service) {
		var vm = this;

		/* Bindable Functions */
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;
		vm.updateSelected = updateSelected;

		/* Bindable Data */
		vm.formData;
		vm.currentPath = '';
		vm.fileList = [];
		vm.allFilesSoFar = [];
		vm.selectedFiles = [];
		vm.selectedPathName = [];
		vm.selectedKeys = [];
		vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
		vm.resultButton = null;
		vm.createButtonOptions = { buttonDefaultText: 'Create Dataset', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;

		/* Extends the Array prototype with a custom method for pushing unique elements */
		/* Needed since a user must be able to select files from multiple directories so */
		/* we must store a list of all the files accessed so far in a separate array */
		/* Check if an element exists in array using a comparer function */
		Array.prototype.inArray = function(comparer) { 
			for(var i=0; i < this.length; i++) { 
				if(comparer(this[i])) return true; 
			}
			return false; 
		}; 

		/* Adds an element to the array if it does not already exist using a comparer function */
		Array.prototype.pushIfNotExist = function(element, comparer) { 
			if (!this.inArray(comparer)) {
				this.push(element);
			}
		};


		//Extracts keys of selected files and stores them in a seperate array which is used to retrieve files from S3
		function updateSelected() {

			vm.selectedPathName = [];

			vm.selectedKeys = Object.keys(vm.selectedFiles)	/* Extracts the keys from the associative array */ 
			.filter(function(key) {					/* Filters the true values only. Left with the file keys */
				return vm.selectedFiles[key]
			});

			vm.selectedKeys.forEach(function(key) {
				var index = vm.allFilesSoFar.findIndex(function(file){return file.textFileKey == key});
				vm.selectedPathName.push(vm.allFilesSoFar[index]);
			});
		}

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}

		/* Gets all the files from the database */
		function getFileList() {
			bsLoadingOverlayService.start({referenceId: 'new-dataset'});	/* Start animated loading overlay */
			filesService.getFileDB(vm.currentPath, '', 'true')
			.then(function(response) {

				response.data.forEach(function(file) {	/* Uses the custom method 'pushIfNotExist' to add unique files to the allFilesSoFar array */
					vm.allFilesSoFar.pushIfNotExist(file, function(element) {
						return element._id === file._id;
					});
				});
				
				vm.fileList = response.data.map(function(file) {	/* Maps the file list to the fileList array adding typeOrder for sorting */
					if(file.type === 'folder') {
						file.typeOrder = 1;	/* For sorting by parent directory, folder, file */
					} else {
						file.typeOrder = 2;	/* For sorting by parent directory, folder, file */
					}
					return file;
				});

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

				listFiles();	/* List files in the view using ng-table */
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'new-dataset'});	/* If error, stop animated loading overlay */
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {typeOrder: "asc", lastModified: "desc"}	/* For sorting by parent directory, folder, file then by last modified date */
			}, {
				dataset: vm.fileList
			});
			bsLoadingOverlayService.stop({referenceId: 'new-dataset'});	/* Stop animated loading overlay */
		}

		/* Gets signed URL to download the requested file from S3. If successful, opens the signed URL in a new tab. */
		/* If folder or parent directory type, navigate to directory. */
		/* If check is true, select the file, otherwise load the file's raw text to view */
		function viewFile(file, check) {
			if(file.type === 'folder') {

				if(file.path === '/') {
					vm.currentPath = file.name;
				} else {
					vm.currentPath = file.path + '/' + file.name;
				}

				vm.pathsArray = vm.currentPath.split("/");
				getFileList();	/* Re-fetch the files with the new path and re-list the files in the table */
			} else if (file.type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				getFileList();	/* Re-fetch the files with the new path and re-list the files in the table */
			} else if (check) {
				vm.selectedFiles[file.textFileKey] = !vm.selectedFiles[file.textFileKey];	/* Toggle the true/false values in the selected keys array  */ 
				updateSelected();
			} else {
				/* Open a blank new tab while still in a trusted context to prevent a popup blocker warning */
				var newTab = $window.open("about:blank", '_blank')

				/* CSS and HTML for loading animation to display while fetching the signed URL */
				var loaderHTML = '<style>#loader{position: absolute;left: 50%;top: 50%;border:0.5em solid rgba(70, 118, 250, 0.2);border-radius:50%;'+
				'border-top:0.5em solid #4676fa;width:75px;height:75px;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite;}'+
				'@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}'+
				'@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'+
				'<div id="loader"></div>';

				/* Write the loading animation code to the new window */
				newTab.document.write(loaderHTML);

				/* Make a request to the server for a signed URL to download/view the requested file */
				s3Service.signDownload(file.path, file.name, 'true')	/* true flag to return the associated text file, not the actual file */
				.then(function(response) {
					/* Remove the animation 1s after the signed URL is retrieved */
					setTimeout(function(){
						newTab.document.getElementById("loader").remove();
					},1000);

					/* View the raw text file in browser */
					newTab.location = response.data.url;
					
				}, function() {
					/* If there is an error, close the new tab */
					newTab.close();
				});
			}
		}

		function onSubmit() {
			processingEvent(true, null);	/* ng-bs-animated-button status & result */
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				} else if(vm.selectedKeys.length < 2) {
					logger.error('Please select at least two files to create a dataset', '', 'Error');
				} else {
					createDataset();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function createDataset() {
			var fileCounter = 0;
			var concatText = '';
			vm.selectedKeys.forEach(function(key){	/* For each key in the vm.selectedKeys array */
				s3Service.signDownloadKey(key)	/* Get a S3 signed URL to download the file */ 
				.then(function(response) {	
					filesService.downloadFile(response.data)	/* Download each file (response.data = signed URL) */
					.then(function(response) {
						fileCounter++
						concatText += response.data + '\n\n';	/* Add text from file to concatText */
						if(fileCounter === vm.selectedKeys.length) {	/* Check if last file */
							var newFile = new File([concatText], vm.formData.datasetName, {type: 'text/plain; charset=utf-8'}); /* Creates the file with the concatText content */
							uploadConcatFile(newFile);
						}
					}, function(err) {
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
				});
			});			
		}

		function uploadConcatFile(newFile) {	/* newFile is the file containing the concatenated text */
			s3Service.signUpload({	/* Get S3 upload URL */
				name: newFile.name,
				extension: 'txt',
				type: 'text/plain; charset=utf-8',
				group: 'dataset'
			})
			.then(function(result) {
				Upload.upload({	/* Upload file using the S3 upload URL */
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: newFile
				})
				.then(function(response) {	/* File uploaded successfully */
					var key = result.data.fields.key;
					var url = result.data.url + '/' + key;

					datasetService.datasetCreate({			/* Using the datasetService, makes an API request to the server to add the new dataset to the database */
						name: vm.formData.datasetName,
						desc: vm.formData.description,
						size : newFile.size,
						key : key,
						url : url,
						createdBy : authentication.currentUser().firstName,
						files: vm.datasetFiles
					})
					.then(function (response) {
						processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
						logger.success('Dataset "' + vm.formData.datasetName + '" was created successfully', '', 'Success')
						setTimeout(function() {
							vm.modal.close(response.data);	/* Close modal if dataset was created successfully in DB and return the response from the DB (the new dataset) */
						}, 1000);	/* Timeout function so the user can see the dataset was created before closing modal */
					});
				}, function(error) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
				});
			}, function(err) {
				processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
			});
		}

		/* For the animated submit button and other elements that should be disabled during event processing */
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
			vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */

			vm.isProcessing = status;	/* Processing flag for other view elements to check */

			if(result === 'error') {	/* Close modal if error */	
				setTimeout(function() {
					vm.modal.cancel(response.data);	
				}, 1000);	/* Timeout function so the user can see an error occured before closing modal */
			}
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	/* Return results */
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();