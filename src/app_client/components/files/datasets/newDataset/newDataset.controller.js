(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('newDatasetCtrl', newDatasetCtrl);

	/* @ngInject */
	function newDatasetCtrl($http, $uibModalInstance, datasetService, filesService, logger, NgTableParams, $window, Upload, authentication) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;

		// Bindable Data
		vm.formData;
		vm.fileList = null;
		vm.datasetFiles = null;

		activate();

		///////////////////////////

		function activate() {
			getFileList();
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			filesService.getFileListDB('true')	// Passing the true string as a parameter in the API request
			.then(function(response) {			// returns only the files with associated text files for analysis
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

		function onSubmit() {
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.datasetName || !vm.formData.description || !vm.formData.checkboxes) {
					logger.error('All fields required, please try again', '', 'Error');
				} else {
					doCreateDataset();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function doCreateDataset() {
			var keys = Object.keys(vm.formData.checkboxes);		// Checks the checkbox object and any key that is true, 
			vm.datasetFiles = keys.filter(function(key) {		// the key is saved into the vm.datasetFiles array
				return vm.formData.checkboxes[key]
			});

			concatTextFiles();
		}

		function concatTextFiles() {
			var fileCounter = 0;
			var concatText = '';
			vm.datasetFiles.forEach(function(key){
				filesService.signDownloadS3(key)
				.then(function(response) {	
					// Might move this to the files or analysis service - which ever makes more sense...
					$http.get(response.data)
					.then(function(data) {
						fileCounter++
						concatText += data.data + '\n\n';
						if(fileCounter === vm.datasetFiles.length) {
							createTextFile(concatText);
						}
					});
				});
			});			
		}

		function createTextFile(concatText) {
			var newFile = new File([concatText], vm.formData.datasetName, {type: "text/plain"});
			uploadConcatFile(newFile);
		}

		function uploadConcatFile(newFile) {
			filesService.signUploadS3({
				name: newFile.name,
				type: 'text/plain',
				dataset: true
			})
			.then(function(result) {
				Upload.upload({
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: newFile
				})
				.progress(function(evt) {
					vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total);
				})
				.then(function(response) {
					console.log(vm.formData.datasetName + ' successfully uploaded to S3');

					var key = result.data.fields.key;
					var url = result.data.url + '/' + encodeURIComponent(key);	// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')

					datasetService.datasetCreate({			// Using the datasetService, makes an API request to
						name: vm.formData.datasetName,		// the server to add the new dataset
						desc: vm.formData.description,
						size : newFile.size,
						key : key,
						url : url,
						createdBy : authentication.currentUser().firstName,
						files: vm.datasetFiles
					})
					.then(function (response) {
						console.log(vm.formData.datasetName + ' successfully added to DB');
						logger.success('Dataset "' + vm.formData.datasetName + '" was created successfully', '', 'Success')
						vm.modal.close(response.data);	// Close modal if dataset was created successfully in DB
					});									// and return the response from the DB (the new dataset)
				}, function(error) {
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
					cleanUpForNextUpload();
				});
			});
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	// Return results
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();