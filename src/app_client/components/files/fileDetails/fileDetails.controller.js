/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name files.controller:fileDetailsCtrl
* @requires $uibModalInstance
* @requires $window
* @requires bsLoadingOverlayService
* @requires services.service:filesService
* @requires services.service:s3Service
* @requires services.service:logger
* @description Displays the file details and options for changing permissions and deleting the file.
*
* The file object in question is passed from the caller and included in the fileDetailsCtrl parameters. 
*/

(function () {

	'use strict';

	angular
	.module('files')
	.controller('fileDetailsCtrl', fileDetailsCtrl);

	/* @ngInject */
	function fileDetailsCtrl(file, $uibModalInstance, $window, bsLoadingOverlayService, filesService, s3Service, logger) {
		var vm = this;

		/* Bindable Functions */
		vm.editFile = editFile;
		vm.updateAclS3 = updateAclS3;
		vm.confirmDelete = confirmDelete;

		/* Bindable Data */
		vm.file = {};
		vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
		vm.resultButton = null;
		vm.edit = { buttonDefaultText: 'Edit', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.makePublicOptions = { buttonDefaultText: 'Make Public', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.makePrivateOptions = { buttonDefaultText: 'Make Private', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };

		activate();

		///////////////////////////

		/**
		* @ngdoc function
		* @name activate
		* @methodOf files.controller:fileDetailsCtrl
		* @description Runs when the page first loads, fetching the file details using 
		* the {@link services.service:filesService#methods_getFile getFile} function from 
		* {@link services.service:filesService filesService}. Starts the loading overlay and adds the 
		* file details to the modal page.
		*/
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'file-details'});
			filesService.getFile(file.path, file.name)
			.then(function(data) {
				bsLoadingOverlayService.stop({referenceId: 'file-details'});
				vm.file = data;
				if(vm.file.tags) {
					vm.tags = vm.file.tags.join(", ");
				}
			});
		}

		function editFile() {
			console.log("hi")
		}
		
		/**
		* @ngdoc function
		* @name updateAclS3
		* @methodOf files.controller:fileDetailsCtrl
		* @param {String} acl String specifying ACL setting (private/public-read)
		* @description Updates the Access Control List (ACL) on S3 so the file is either private or public. 
		* There are other options also avaliable - check aws-sdk js api documentation. If successful, calls 
		* the {@link files.controller:fileDetailsCtrl#methods_updateAclDB updateAclDB} function to update
		* the ACL settings in the database.
		*/
		function updateAclS3(acl) {
			vm.isSubmittingButton = true;
			console.log(vm.file.key);
			s3Service.updateACL({key: vm.file.key, acl: acl})
			.then(function() {
				updateAclDB(acl);
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		/**
		* @ngdoc function
		* @name updateAclDB
		* @param {String} acl String specifying ACL setting (private/public-read)
		* @methodOf files.controller:fileDetailsCtrl
		* @description Updates the Access Control List (ACL) in the database so the file is either private 
		* or public. There are other options also avaliable - check aws-sdk js api documentation.
		*/
		function updateAclDB(acl) {
			filesService.updateACL({key: vm.file.key, acl: acl})
			.then(function() {
				vm.resultButton = 'success';
				vm.file.acl = acl
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		/**
		* @ngdoc function
		* @name confirmDelete
		* @methodOf files.controller:fileDetailsCtrl
		* @description Displays a popup alert for the user to confirm the deletion. If confirmed, 
		* the {@link files.controller:fileDetailsCtrl#methods_deleteFile deleteFile} function 
		* is called to delete the file from the database.
		*/
		function confirmDelete() {
			swal({
				title: "Are you sure?",
				html: true,
				text: "<p>Confirm to delete the file '<strong>" + vm.file.name + "</strong>'</p>",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				closeOnConfirm: false,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				if(vm.file.analyses.length > 0) {
					swal({
						title: "Are you positive?",
						html: true,
						text: "<p>'<strong>" + vm.file.name + "</strong>' is included in an analysis, are you still sure you want to delete this file?</p><br /><p>The analysis results will still be available.</p>",
						type: "warning",
						showCancelButton: true,
						allowOutsideClick: true,
						confirmButtonColor: "#d9534f",
						confirmButtonText: "Yes! delete it!"
					}, function() {
						deleteFileDB();
					});
				} else {
					deleteFileDB();
					swal.close();
				}
			});
		}

		/**
		* @ngdoc function
		* @name deleteFileDB
		* @methodOf files.controller:fileDetailsCtrl
		* @description Uses the {@link services.service:filesService#methods_deleteFile deleteFile} 
		* function from {@link services.service:filesService filesService} to delete the file from the database.
		* On success, calls {@link files.controller:fileDetailsCtrl#methods_deleteFileS3 deleteFileS3} to delete 
		* the file from the S3 server.
		*/
		function deleteFileDB() {
			filesService.deleteFile(vm.file.path, vm.file.name)
			.then(function() {
				deleteFileS3();
			});
		}

		/**
		* @ngdoc function
		* @name deleteFileS3
		* @methodOf files.controller:fileDetailsCtrl
		* @description Uses the {@link services.service:s3Service#methods_deleteFile deleteFile} 
		* function from {@link services.service:s3Service s3Service} to delete the file from the S3 server.
		* On success, checks if file has an associated text file on S3, if so, also deletes.
		* Displays success message and informs the caller to remove the file then closes the modal.
		*/
		function deleteFileS3() {
			s3Service.deleteFile(vm.file.key)
			.then(function() {
				/* If a text file was generated for analysis, delete that file too. */
				/* If the original file was a text file, just delete the original file */
				if(vm.file.textFileKey && vm.file.textFileKey != vm.file.key){
					s3Service.deleteFile(vm.file.textFileKey);
				}
				/* Close modal if the file was deleted successfully and return the action delete */
				/* to notify the caller of the modal. */
				vm.modal.close({action: 'delete'});
				logger.success("'" + vm.file.name + "' was deleted successfully", "", "Success");
			});
		}

		vm.modal = {
			close : function(result) {
				$uibModalInstance.close(result);
			}, 
			cancel : function() {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();