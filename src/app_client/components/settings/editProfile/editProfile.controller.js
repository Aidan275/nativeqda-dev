(function () { 

	angular
	.module('settings')
	.controller('editProfileCtrl', editProfileCtrl);
	
	/* @ngInject */
	function editProfileCtrl($scope, $uibModalInstance, userEmail, usersService, bsLoadingOverlayService, logger, authService, Upload, $animate, s3Service) {
		var vm = this;

		/* Bindable Functions */
		vm.getUserInfo = getUserInfo;
		vm.onAvatarSelect = onAvatarSelect;
		vm.onSubmit = onSubmit;
		vm.togglePassword = togglePassword;

		/* Bindable Data */
		vm.userInfo = {};
		vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
		vm.resultButton = null;
		vm.saveProfileButtonOptions = { buttonDefaultText: 'Save Profile', animationCompleteTime: 1000, buttonSubmittingText: 'Saving...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;
		vm.changePassword = false;

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'user-info'});	/* Start animated loading overlay */
			getUserInfo();
		}

		/* Gets all the files from the MongoDB database */
		function getUserInfo() {
			usersService.getUserInfo(userEmail)
			.then(function(data) {
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	/* Stop animated loading overlay */
				vm.userInfo = data;
			}, function(err){
				bsLoadingOverlayService.stop({referenceId: 'user-info'});	/* If error, stop animated loading overlay */
			});
		}

		/* Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL */
		/* If successful, the file info is then posted to the DB */
		/* need to make neater */
		function onAvatarSelect(uploadFiles) {
			if (uploadFiles.length > 0 ) {
				vm.file = uploadFiles[0];
				/* Checks if file's size is less than 10 MB */
				if(vm.file.size < 10485760) {	
					var fileExtension = (vm.file.name.split('.').pop()).toLowerCase();
					switch (fileExtension) {
						case 'gif':
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'bmp':
						vm.file = uploadFiles[0];
						vm.fileInfo = {
							extension: fileExtension,
							type: vm.file.type,
							readType: 'public-read',	/* Sets the ACL option in S3 to public-read so a signed URL doesn't need to be generated each time the avatar is requested. */
							group: 'avatar'	/* Root folder the file is stored in on S3 - limited number of choices, check back-end */ 
						};

						/* File reader to display the image before confirming upload. */
						var reader = new FileReader();

						reader.onload = function (e) {
							var avatarImgContainer = document.getElementById("upload-avatar-container");
							avatarImgContainer.style.backgroundImage  = "url('" + e.target.result + "')"; 
							var avatarImg = document.getElementById("upload-avatar");
							avatarImg.src = e.target.result; 
						}

						reader.readAsDataURL(vm.file);
						break;
						default: 
						logger.error("The selected file is not a supported image file", "", "Error");	/* If not an image file (by file extension) */
						cleanUpForNextUpload();
					}
				} else {
					logger.error("Maximum file size is 10 MB. \nPlease select a smaller file.", "", "Error");	/* If larger, display message and reinitialise the file variables */
					cleanUpForNextUpload();
				}
			}
		}

		function onSubmit() {
			if(!vm.userInfo.firstName) {	/* company not included since it is not required */
				logger.error('Please enter your first name', '', 'Error');
			} else if (!vm.userInfo.lastName) {
				logger.error('Please enter your last name', '', 'Error');
			} else if (!vm.userInfo.email) {
				logger.error('Please enter a valid email address', '', 'Error');
			} else if (!vm.userInfo.password && vm.profileForm.password.$dirty) {	/* Checks if the password is not empty and if the password field has been editted */
				logger.error('Please enter a password', '', 'Error');				/* If the password field has not been editted, the original password is kept */
			} else if (!vm.userInfo.confirmPassword && vm.profileForm.confirmPassword.$dirty) {
				logger.error('Please confirm your password', '', 'Error');
			} else if (vm.userInfo.password === '' ||  vm.userInfo.confirmPassword === '') {
				logger.error('Password cannot be blank', '', 'Error');
			}else if(vm.userInfo.password != vm.userInfo.confirmPassword) {
				logger.error('Passwords do not match', '', 'Error');
			} else {
				updateProfile();
			}
		}

		function updateProfile() {
			processingEvent(true, null);	/* ng-bs-animated-button status & result */
			if(vm.file) {
				uploadAvatar();
			} else {
				uploadUserInfo();
			}
		}

		function uploadAvatar() {
			s3Service.signUpload(vm.fileInfo)
			.then(function(data) {
				Upload.upload({
					method: 'POST',
					url: data.url, 
					fields: data.fields, 
					file: vm.file
				})
				.then(function(response) {
					console.log('Avatar successfully uploaded to S3');
					/* parses XML data response to jQuery object to be stored in the database */
					var xml = $.parseXML(response);
					var key = data.fields.key;
					vm.userInfo.avatar = data.url + '/' + encodeURIComponent(key);	/* Encode the key for the API URL in case it includes reserved characters (e.g '+', '&') */
					uploadUserInfo();
				}, function(error) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
					cleanUpForNextUpload();
				});
			}, function(err) {
				processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
			});
		}

		/* Save user info to the database */
		function uploadUserInfo() {
			usersService.updateProfile(vm.userInfo)
			.then(function(data) {
				authService.saveToken(data);	/* Updated the JWT stored in the browser */
				processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
				console.log('Successfully updated profile');
				logger.success('Successfully updated profile', '', 'Success');
				cleanUpForNextUpload();
				setTimeout(function() {
					vm.modal.close(data);	/* Close modal if profile was updated successfully */
				}, 1000);	/* Timeout function so the user can see the profile has updated before closing modal */
			});
		}

		function togglePassword() {
			if(vm.changePassword === false) {
				vm.changePassword = true;
			} else {
				vm.changePassword = false;
				vm.userInfo.confirmPassword = null;
				vm.userInfo.password = null;
				vm.profileForm.confirmPassword.$setPristine();
				vm.profileForm.password.$setPristine();
			}
		}

		/* For the animated submit button and other elements that should be disabled during event processing */
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
			vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */
			vm.isProcessing = status;	/* Processing flag for other view elements to check */
		}

		function cleanUpForNextUpload() {
			vm.file = null;
			vm.fileInfo = {};
			vm.textFile = {};
			vm.textFileInfo = {};
			document.getElementById("file-upload-input").value = "";
		}

		vm.modal = {
			close : function() {
				$uibModalInstance.close();
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};
		
	}


})();