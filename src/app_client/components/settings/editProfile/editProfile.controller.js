(function () { 

	angular
	.module('nativeQDAApp')
	.controller('editProfileCtrl', editProfileCtrl);
	
	/* @ngInject */
	function editProfileCtrl($scope, $uibModalInstance, userEmail, usersService, bsLoadingOverlayService, logger, authentication) {
		var vm = this;

		// Bindable Functions
		vm.getUserInfo = getUserInfo;
		vm.onAvatarSelect = onAvatarSelect;
		vm.onSubmit = onSubmit;
		vm.setDelay = setDelay;	// function to set delay on view element change (e.g. entering password)

		// Bindable Data
		vm.userInfo = {
			email: '', 
			firstName: '',
			lastName: '',
			company: '',
			settings: '',
			avatar: ''
		};
		vm.delay = false;	// variable added to view element that should be delayed (e.g. un-matching password error)
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.saveProfileButtonOptions = { buttonDefaultText: 'Save Profile', animationCompleteTime: 1000, buttonSubmittingText: 'Saving...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;

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
		function onAvatarSelect(uploadFiles) {
			if (uploadFiles.length > 0 ) {
				if(uploadFiles[0].size < 10485760) {	// Checks if file's size is less than 10 MB
					vm.file = uploadFiles[0];
				vm.fileInfo = {
					name: vm.vm.userInfo.firstName + '-avatar',
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

		function onSubmit() {
			if(!vm.userInfo.firstName || !vm.userInfo.lastName || !vm.userInfo.email || !vm.userInfo.company) {
				logger.error('All fields required, please try again', '', 'Error');
			} else if(vm.userInfo.password != vm.userInfo.confirmPassword) {
				logger.error('Passwords do not match', '', 'Error');
			} else {
				updateProfile();
			}
		}

		function updateProfile() {
			if(vm.file) {
				processingEvent(true, null);	// ng-bs-animated-button status & result
				var fileExtension = (vm.fileInfo.name.split('.').pop()).toLowerCase();
				if(fileExtension === 'png'){
					uploadAvatar();
				}
			} else {
				uploadUserInfo();
			}
		}

		function uploadAvatar() {
			filesService.signUploadS3(vm.fileInfo)
			.then(function(result) {
				Upload.upload({
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: vm.file
				})
				.then(function(response) {
					console.log(vm.fileInfo.name + ' successfully uploaded to S3');
					// parses XML data response to jQuery object to be stored in the database
					var xml = $.parseXML(response.data);
					vm.userInfo.avatar = result.data.url + '/' + encodeURIComponent(key);	// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')
					uploadUserInfo();
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

		// Save user info to the database
		function uploadUserInfo() {
			usersService.updateProfile(vm.userInfo)
			.then(function(response) {
				authentication.saveToken(response.data);	// Updated the JWT stored in the browser
				processingEvent(false, 'success');	// ng-bs-animated-button status & result
				console.log('Successfully updated profile');
				logger.success('Successfully updated profile', '', 'Success');
				cleanUpForNextUpload();
				setTimeout(function() {
					vm.modal.close(response.data);	// Close modal if profile was updated successfully
				}, 1000);	// Timeout function so the user can see the profile has updated before closing modal
			});
		}

		// For the animated submit button and other elements that should be disabled during event processing
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	// ng-bs-animated-button status
			vm.resultButton = result;	// ng-bs-animated-button result (error/success)
			vm.isProcessing = status;	// Processing flag for other view elements to check
		}

		// Delay for showing error message if passwords don't match
		function setDelay() {
			vm.delay = true;
			setTimeout(function(){
				vm.delay = false;
				$scope.$apply();
			}, 300);
		}
	}


})();