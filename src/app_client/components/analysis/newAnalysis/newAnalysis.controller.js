(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('newAnalysisCtrl', newAnalysisCtrl);

	/* @ngInject */
	function newAnalysisCtrl($uibModalInstance, $window, NgTableParams, datasetService, filesService, analysisService, authentication, logger, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;

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

		activate();

		///////////////////////////

		function activate() {
			vm.data = [];	// Reset data list if navigating folders
			vm.formData.selectedID = null;	// Reset selected file/dataset if navigating folders
			bsLoadingOverlayService.start({referenceId: 'data-list'});	// Start animated loading overlay
			getDatasetList();
		}

		// Gets all the datasets from the MongoDB database
		function getDatasetList() {
			datasetService.listDatasets()
			.then(function(response) {
				response.data.forEach(function(data) {
					data.type = 'Dataset';
					vm.data.push(data);
				});
				getFileList();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'data-list'});	// If error, stop animated loading overlay
			});
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			filesService.getFileDB(vm.currentPath, 'true')
			.then(function(response) {
				response.data.forEach(function(data) {
					vm.data.push(data);
				});
				if(vm.currentPath != '') {
					vm.data.push({
						name: '..',
						lastModified: '',
						createdBy: '',
						size: '',
						type: 'parent-dir'
					});
				}
				listData();
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'data-list'});	// If error, stop animated loading overlay
			});
		}

		function listData() {
			vm.tableParams = new NgTableParams({
				sorting: {type: "desc"}
			}, {
				dataset: vm.data
			});
			bsLoadingOverlayService.stop({referenceId: 'data-list'});	// Stop animated loading overlay
		}

		function onSubmit() {
			if(!vm.formData.analysisName || !vm.formData.description) {
				logger.error('All fields required, please try again', '', 'Error');
			} else if(!vm.formData.selectedID) {
				logger.error('Please select data for analysis', '', 'Error');
			} else {
				doAnalysis();
			}
		}

		function doAnalysis() {
			processingEvent(true, null);	// ng-bs-animated-button status & result

			// Find the index for the selected file/dataset, will return -1 if not found 
			var dataIndex = vm.data.findIndex(function(obj){return obj._id === vm.formData.selectedID});

			var name = vm.data[dataIndex].name;
			var path = vm.data[dataIndex].path;
			vm.formData.sourceDataKey = vm.data[dataIndex].textFileKey;

			filesService.signDownloadS3(name, path, 'true')	// true flag to return the associated text file, not the actual file
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
				activate();
			} else if (type === 'parent-dir') {
				vm.currentPath = vm.currentPath.substr(0, vm.currentPath.lastIndexOf('/'));
				vm.pathsArray = vm.currentPath.split("/");
				activate();
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
				filesService.signDownloadS3(name, path, 'true')	// true flag to return the associated text file, not the actual file
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