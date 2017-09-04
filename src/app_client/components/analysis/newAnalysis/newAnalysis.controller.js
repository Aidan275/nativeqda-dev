(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('newAnalysisCtrl', newAnalysisCtrl);

	/* @ngInject */
	function newAnalysisCtrl($uibModalInstance, $window, NgTableParams, datasetService, filesService, analysisService, authentication, logger, bsLoadingOverlayService, s3Service) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;
		vm.updateSelected = updateSelected;
		vm.doMultipleAnalysis = doMultipleAnalysis;

		// Bindable Data
		vm.data = [];
		vm.currentPath = '';
		vm.pathsArray = [''];
		vm.tableParams;
		vm.formData = {};
		vm.analysisResults;
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.analyseButtonOptions = { buttonDefaultText: 'Analyse', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;
		vm.selectedFiles = [];
		vm.selectedPathName = [];
		vm.selectedKeys = [];
		vm.allFilesSoFar = [];
		vm.fileList = [];

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
			//Remove?
			//getDatasetList();
			getFileList();
		}

		/*
		Removing 
		// Gets all the datasets from the MongoDB database
		function getDatasetList() {
			bsLoadingOverlayService.start({referenceId: 'data-list'});	// Start animated loading overlay
			vm.data = [];	// Reset data list if navigating folders
			vm.formData.selectedID = null;	// Reset selected file/dataset if navigating folders
			datasetService.listDatasets()
			.then(function(response) {
				response.data.forEach(function(data) {
					data.type = 'Dataset';
					data.typeOrder = 3;
					vm.data.push(data);
				});
				getFileList();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'data-list'});	// If error, stop animated loading overlay
			});
		}
		*/

		// Gets all the files from the database
		function getFileList() {
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
					vm.data.push({
						name: '..',
						lastModified: '',
						createdBy: '',
						size: '',
						type: 'parent-dir',
						typeOrder: 0	/* For sorting by parent directory, folder, file */
					});
				}

				response.data.forEach(function(file) {	/* Add each file to the data array */
					if(file.type === 'folder') {
						file.typeOrder = 1;	/* For sorting by parent directory, folder, file */
					} else {
						file.typeOrder = 2;	/* For sorting by parent directory, folder, file */
					}
					vm.data.push(file);
				});
				listData();	/* List data in the view using ng-table */
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'data-list'});	// If error, stop animated loading overlay
			});
		}

		function listData() {
			vm.tableParams = new NgTableParams({
				sorting: {typeOrder: "asc", lastModified: "desc"}	/* For sorting by parent directory, folder, file then by last modified date */
			}, {
				dataset: vm.data
			});
			bsLoadingOverlayService.stop({referenceId: 'data-list'});	// Stop animated loading overlay
		}

		function onSubmit() {
	
			processingEvent(true, null);	/* ng-bs-animated-button status & result */
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.analysisName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				}	else if (vm.selectedKeys.length < 2) {
					doAnalysis();
				} else {
					doMultipleAnalysis();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}



		function doAnalysis() {
			processingEvent(true, null);	// ng-bs-animated-button status & result

				
			// Find the index for the selected file/dataset, will return -1 if not found 
			var dataIndex = vm.data.findIndex(function(obj){return obj._id === vm.formData.selectedID});

			var name = vm.data[dataIndex].name;
			var path = vm.data[dataIndex].path;
			vm.formData.sourceDataKey = vm.data[dataIndex].textFileKey;

			//console.log(name);
			//console.log(path);

			
			s3Service.signDownload(path, name, 'true')	// true flag to return the associated text file, not the actual file
			.then(function(response) {
				analysisService.watsonAnalysis({url: response.data.url})
				.then(function(response) {
					vm.analysisResults = response.data;
					saveAnalysisResults();
				}, function(err) {
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
				});
			}, function(err) {
				processingEvent(false, 'error');	// ng-bs-animated-button status & result
			});
				
		}

		function doMultipleAnalysis() {

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
						}
					}, function(err) {
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
				});
			});	

			//Send string to server
			analysisService.watsonTextAnalysis({text: concatText});
		}


		function saveAnalysisResults() {
			var saveData = {
				name: vm.formData.analysisName,
				description: vm.formData.description,
				createdBy: authentication.currentUser().firstName,
				sourceDataKey: vm.formData.sourceDataKey,
				language: vm.analysisResults.language,
				categories: vm.analysisResults.categories,
				concepts: vm.analysisResults.concepts,
				entities: vm.analysisResults.entities,
				keywords: vm.analysisResults.keywords,
				relations: vm.analysisResults.relations,
				semanticRoles: vm.analysisResults.semantic_roles
			};

			analysisService.saveWatsonAnalysis(saveData)
			.then(function(response) {
				logger.success('Analysis "' + vm.formData.analysisName + '" successfully completed', '', 'Success')
				processingEvent(false, 'success');	// ng-bs-animated-button status & result
				setTimeout(function() {
					vm.modal.close(response.data);	// Close modal if the analysis was completed successfully and return the new analysis data
				}, 1000);	// Timeout function so the user can see the analysis has completed before closing modal
			}, function(err) {
				processingEvent(false, 'error');	// ng-bs-animated-button status & result
			});
		}

		// Gets signed URL to download the requested file from S3. If successful, opens the signed URL in a new tab.
		// If folder or parent directory type, navigate to directory.
		// If tick is true, select the file/dataset, otherwise load the file/dataset raw text to view
		// id is for marking the radio button of the selected file/dataset
		function viewFile(name, path, type, tick, id) {	
			if(type === 'folder') {	

				if(path === '/') {
					vm.currentPath = name;
				} else {
					vm.currentPath = path + '/' + name;
				}

				vm.pathsArray = vm.currentPath.split("/");
				getDatasetList();	// Re-fetch the data with the new path and re-list the data in the table
			} else if (type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				getDatasetList();	// Re-fetch the data with the new path and re-list the data in the table
			} else if (tick) {
				vm.formData.selectedID = id;
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
				s3Service.signDownload(path, name, 'true')	// true flag to return the associated text file, not the actual file
				.then(function(response) {
					// Remove the animation 1s after the signed URL is retrieved
					setTimeout(function(){
						newTab.document.getElementById("loader").remove();
					},1000);

					// View the raw text file in browser
					newTab.location = response.data.url;
					
				}, function() {
					// If there is an error, close the new tab
					newTab.close();
				});
			}
		}

		// For the animated submit button and other elements that should be disabled during event processing
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	// ng-bs-animated-button status
			vm.resultButton = result;	// ng-bs-animated-button result (error/success)

			vm.isProcessing = status;	// Processing flag for other view elements to check
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	// Return results
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();