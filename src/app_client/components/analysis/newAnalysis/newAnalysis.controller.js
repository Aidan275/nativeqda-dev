/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc controller
* @name analysis.controller:newAnalysisCtrl
* @description Controller for the new analysis modal.
*/

(function () {

	'use strict';

	angular
	.module('analysis')
	.controller('newAnalysisCtrl', newAnalysisCtrl);

	/* @ngInject */
	function newAnalysisCtrl($uibModalInstance, $window, NgTableParams, datasetService, filesService, analysisService, authService, logger, bsLoadingOverlayService, s3Service) {
		var vm = this;

		/* Bindable Functions */
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;
		vm.updateSelected = updateSelected;
		vm.checkOrOpen = checkOrOpen;	/* Check the checkbox if file, open folder if folder */
		vm.isInArray = isInArray;

		/* Bindable Data */
		vm.fileList = [];
		vm.currentPath = '';
		vm.pathsArray = [''];
		vm.tableParams;
		vm.formData = {};
		vm.analysisResults;
		vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
		vm.resultButton = null;
		vm.analyseButtonOptions = { buttonDefaultText: 'Analyse', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;
		vm.allFilesSoFar = [];		/* Keeps track of all the files when navigating folders */
		vm.selectedFileIds = [];	/* Associative array of file ids - true/false depending on checkboxes selected */
		vm.fileIds = []				/* Array of file ids extracted from the vm.selectedFileIds associative array */
		vm.selectedFiles = [];		/* Selected files determined from file ids - updated when checkboxes changed */

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

		function isInArray(value, array) {
			console.log(value);
			console.log(array);
			return array.indexOf(value) > -1;
		}

		function updateSelected() {
			vm.fileIds = []
			vm.selectedFiles = [];

			vm.fileIds = Object.keys(vm.selectedFileIds)	/* Extracts the keys from the associative array */ 
			.filter(function(id) {						/* Filters the true values only. Left with the file ids */
				return vm.selectedFileIds[id]
			});

			/* Finds all the files in the vm.allFilesSoFar array using the vm.fileIds */
			/* and adds them to the vm.selectedFiles array */
			vm.fileIds.forEach(function(id) {
				var index = vm.allFilesSoFar.findIndex(function(file){return file._id == id});
				vm.selectedFiles.push(vm.allFilesSoFar[index]);
			});
		}

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}

		/* Gets all the files from the database */
		function getFileList() {
			bsLoadingOverlayService.start({referenceId: 'file-list'});	/* Start animated loading overlay */
			filesService.getFileDB(vm.currentPath, '', 'true')
			.then(function(data) {

				data.forEach(function(file) {	/* Uses the custom method 'pushIfNotExist' to add unique files to the allFilesSoFar array */
					vm.allFilesSoFar.pushIfNotExist(file, function(element) {
						return element._id === file._id;
					});
				});

				vm.fileList = data.map(function(file) {	/* Maps the file list to the fileList array adding typeOrder for sorting */
					if(file.type === 'folder') {
						file.typeOrder = 1;	/* Folders are initially sorted 2nd from the top */
					} else {
						file.typeOrder = 2;	/* Files are initially sorted 3rd from the top */
					}
					return file;
				});

				/* If not the root directory, add a parent director link */
				if(vm.currentPath != '') {
					vm.fileList.push({
						name: '..',
						lastModified: '',
						createdBy: '',
						size: '',
						type: 'parent-dir',
						typeOrder: 0	/* The parent directory is initially  sorted 1st from the top */
					});
				}

				listData();	/* List data in the view using ng-table */
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'file-list'});	/* If error, stop animated loading overlay */
			});
		}

		function listData() {
			vm.tableParams = new NgTableParams({
				sorting: {typeOrder: "asc", lastModified: "desc"}	/* For sorting by parent directory, folder, file then by last modified date */
			}, {
				dataset: vm.fileList
			});
			bsLoadingOverlayService.stop({referenceId: 'file-list'});	/* Stop animated loading overlay */
		}

		function onSubmit() {
			processingEvent(true, null);	/* ng-bs-animated-button status & result */
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.analysisName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				} else {
					getTextFromFiles();
					return true;
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function getTextFromFiles() {
			var fileCounter = 0;
			var concatText = '';
			vm.selectedFiles.forEach(function(file){	/* For each key in the vm.selectedKeys array */
				s3Service.signDownloadKey(file.textFileKey)	/* Get a S3 signed URL to download the file */ 
				.then(function(data) {	
					filesService.downloadFile(data)	/* Download each file (data = signed URL) */
					.then(function(data) {
						fileCounter++
						concatText += data + '\n\n';	/* Add text from file to concatText */

						/*Send text to be analyzed */
						doAnalysisSave(concatText);

					}, function(err) {
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
				});
			});	
		}

		function doAnalysisSave(concatText) {
			var saveData = {
				text: concatText,
				name: vm.formData.analysisName,
				description: vm.formData.description,
				createdBy: authService.currentUser().firstName,
				files: vm.fileIds
			};

			analysisService.watsonTextAnalysis(saveData)
			.then(function(data) {
				logger.success('Analysis "' + vm.formData.analysisName + '" successfully completed', '', 'Success')
				processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
				setTimeout(function() {
					vm.modal.close(data);	/* Close modal if the analysis was completed successfully and return the new analysis data */
				}, 1000);	/* Timeout function so the user can see the analysis has completed before closing modal */
			}, function(err) {
				processingEvent(false, 'error');
			});
		}

		/* Gets signed URL to download the requested file from S3. If successful, opens the signed URL in a new tab. */
		/* If folder or parent directory type, navigate to directory. */
		/* If tick is true, select the file/dataset, otherwise load the file/dataset raw text to view */
		/* id is for marking the radio button of the selected file/dataset */
		function checkOrOpen(file) {	
			if(file.type === 'folder') {	

				if(file.path === '/') {
					vm.currentPath = file.name;
				} else {
					vm.currentPath = file.path + '/' + file.name;
				}

				vm.pathsArray = vm.currentPath.split("/");
				getFileList();	/* Re-fetch the data with the new path and re-list the files in the table */
			} else if (file.type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				getFileList();
			} else {
				vm.selectedFileIds[file._id] = !vm.selectedFileIds[file._id];	/* Toggle the true/false values in the selected file ids array  */ 
				updateSelected();
			}
		}

		/* Function for opening a selected file, the file varibale contains all the file information directly */
		/* from the table, the raw variable is a boolean that specifies if opening actual file or the text file */
		/* raw must be a true or false string */
		function viewFile(file, raw) {	
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
			s3Service.signDownload(file.path, file.name, raw)	/* raw variable flag to return the associated text file or the actual file */
			.then(function(data) {
				/* Remove the animation 1s after the signed URL is retrieved */
				setTimeout(function(){
					var loader = newTab.document.getElementById("loader");
					if(loader) {
						loader.remove();
					}
				},1000);

				/* Redirect the new tab to the signed URL */
				/* If raw text is true, view in browser. */
				if(raw === 'true') {
					newTab.location = data.url;
				} else {
					/* Else the file is a document and not the raw text so open in google docs viewer to view in the browser */
					var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(data.url) + '&embedded=true';
					newTab.location = encodedUrl;
				}

			}, function() {
				/* If there is an error, close the new tab */
				newTab.close();
			});

		}

		/* For the animated submit button and other elements that should be disabled during event processing */
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
			vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */

			vm.isProcessing = status;	/* Processing flag for other view elements to check */
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	/* Return results */
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();