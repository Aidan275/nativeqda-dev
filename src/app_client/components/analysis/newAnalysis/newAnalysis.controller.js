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
		vm.tableParams;
		vm.formData;
		vm.analysisResults;
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.analyseButtonOptions = { buttonDefaultText: 'Analyse', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;

		activate();

		///////////////////////////

		function activate() {
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
			filesService.getFileListDB('true')
			.then(function(response) {
				response.data.forEach(function(data) {
					data.type = 'File';
					vm.data.push(data);
				});
				listData();
			}, function(err) {
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
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.analysisName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				} else if(!vm.formData.selectedDataKey) {
					logger.error('Please select data for analysis', '', 'Error');
				} else {
					doAnalysis();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function doAnalysis() {
			processingEvent(true, null);	// ng-bs-animated-button status & result
			filesService.signDownloadS3(vm.formData.selectedDataKey)
			.then(function(response) {
				analysisService.watsonAnalysis({url: response.data})
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
				sourceDataKey: vm.formData.selectedDataKey,
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
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
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