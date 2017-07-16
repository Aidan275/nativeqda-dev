(function () { 

	angular
	.module('nativeQDAApp')
	.controller('editProfileCtrl', editProfileCtrl);
	
	/* @ngInject */
	function editProfileCtrl($uibModalInstance, userEmail, usersService, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.getUserInfo = getUserInfo;

		// Bindable Data
		vm.userInfo = {
			email: '', 
			firstName: '',
			lastName: '',
			company: '',
			avatar: ''
		};

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'user-info'});	// Start animated loading overlay
			getUserInfo();
		}

		// Gets all the files from the MongoDB database
		function getUserInfo() {
			usersService.getUserInfo(userEmail)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	// Stop animated loading overlay
				vm.userInfo = response.data;
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	// If error, stop animated loading overlay
			});
		}

		vm.modal = {
			close : function() {
				$uibModalInstance.close();
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};
		
		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			if (uploadFiles.length > 0 ) {
				if(uploadFiles[0].size < 10485760) {	// Checks if file's size is less than 10 MB
					vm.file = uploadFiles[0];
					vm.fileInfo = {
						name: vm.file.name,
						type: vm.file.type,
						readType: 'public-read'		// Sets the ACL option in S3 to public-read so a signed URL doesn't need to be generated each time the avatar is requested.
					};
				} else {
					logger.error("Maximum file size is 10 MB. \nPlease select a smaller file.", "", "Error");	// If larger, display message and reinitialise the file variables
					cleanUpForNextUpload();
				}
			}
		}
		
		function cleanUpForNextUpload() {
			vm.file = null;
			vm.fileInfo = {};
			vm.textFile = {};
			vm.textFileInfo = {};
			document.getElementById("file-upload-input").value = "";
		}

		function uploadFile() {
			if(vm.file) {
				processingEvent(true, null);	// ng-bs-animated-button status & result
				var fileExtension = (vm.fileInfo.name.split('.').pop()).toLowerCase();
				if(fileExtension === 'png'){
					uploadActualFile();
				}
			} else {
				logger.error("Please select a file to upload.", "", "Error");
			}
		}

		function uploadActualFile() {
			filesService.signUploadS3(vm.fileInfo)
			.then(function(result) {
				Upload.upload({
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: vm.file
				})
				.progress(function(evt) {
					vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total);
				})
				.then(function(response) {
					console.log(vm.fileInfo.name + ' successfully uploaded to S3');
					// parses XML data response to jQuery object to be stored in the database
					var xml = $.parseXML(response.data);
					var url = result.data.url + '/' + encodeURIComponent(key);	// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')
					
					//Set avatar
					authenticationService.setavatar(url).then(function(response) {
						processingEvent(false, 'success');	// ng-bs-animated-button status & result
						console.log(vm.fileInfo.name + ' successfully added to DB');
						logger.success(vm.fileInfo.name + ' successfully uploaded', '', 'Success');
						cleanUpForNextUpload();
					});
				}, function(error) {
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
					cleanUpForNextUpload();
				});
			}, function(err) {
				processingEvent(false, 'error');	// ng-bs-animated-button status & result
			});
		}

		// For the animated submit button and other elements that should be disabled during event processing
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	// ng-bs-animated-button status
			vm.resultButton = result;	// ng-bs-animated-button result (error/success)

			vm.isProcessing = status;	// Processing flag for other view elements to check
		}
	}


})();