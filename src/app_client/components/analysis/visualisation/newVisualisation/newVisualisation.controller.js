(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('newVisualisationCtrl', newVisualisationCtrl);

	/* @ngInject */
	function newVisualisationCtrl ($uibModalInstance, $window, NgTableParams, datasetService, filesService, analysisService, authentication, logger) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;

		// Bindable Data
		vm.datasetList;
		vm.tableParams;
		vm.formData;
		vm.analysisResults;
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.createButtonOptions = { buttonDefaultText: 'Create Visualisation', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };

		activate();

		///////////////////////////

		function activate() {
			getDatasetList();
		}

		// Gets all the files from the MongoDB database
		function getDatasetList() {
			datasetService.listDatasets()
			.then(function(response) {
				vm.datasetList = response.data;
				listDatasets();
			});
		}

		function listDatasets() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.datasetList
			});
		}

		function onSubmit() {
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.visualisationName || !vm.formData.description || !vm.formData.selectedDatasetKey) {
					logger.error('All fields required, please try again', '', 'Error');
				} else {
					createVisualisation();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function createVisualisation() {
			vm.isSubmittingButton = true;
			filesService.signDownloadS3(vm.formData.selectedDatasetKey)
			.then(function(response) {
				analysisService.watsonConceptAnalysis({url: response.data})
				.then(function(response) {
					vm.analysisResults = response.data;
					saveAnalysisResultsDB();
				}, function(err) {
					vm.resultButton = 'error';
				});
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		function saveAnalysisResultsDB() {
			var saveData = {
				name: vm.formData.visualisationName,
				description: vm.formData.description,
				createdBy: authentication.currentUser().firstName,
				sourceDataKey: vm.formData.selectedDatasetKey,
				language: vm.analysisResults.language,
				concepts: vm.analysisResults.concepts
			};

			analysisService.saveConceptAnalysis(saveData)
			.then(function(response) {
				logger.success('Visualisation "' + vm.formData.visualisationName + '" was created successfully', '', 'Success')
				vm.resultButton = 'success';
			}, function(err) {
				vm.resultButton = 'error';
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

		vm.modal = {
			close : function () {
				$uibModalInstance.close();
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();