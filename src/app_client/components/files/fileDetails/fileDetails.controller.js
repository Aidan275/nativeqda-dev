(function () {

	'use strict';

	angular
	.module('files')
	.controller('fileDetailsCtrl', fileDetailsCtrl);

	/* @ngInject */
	function fileDetailsCtrl (file, $uibModalInstance, $window, filesService, bsLoadingOverlayService, s3Service) {
		var vm = this;

		// Bindable Functions
		vm.updateAclS3 = updateAclS3;

		// Bindable Data
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.makePublicOptions = { buttonDefaultText: 'Make Public', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };
		vm.makePrivateOptions = { buttonDefaultText: 'Make Private', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'file-details'});
			filesService.getFileDB(file.path, file.name)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'file-details'});
				vm.file = response.data;
				if(vm.file.tags) {
					vm.tags = vm.file.tags.join(", ");
				}
			});
		}

		// Updates the Access Control List so the file is either private or public
		// There are other options also avaliable - check aws-sdk js api documentation
		// S3 ACL Update - if successful, update database ACL
		function updateAclS3(key, acl) {
			vm.isSubmittingButton = true;
			s3Service.updateACL({key: key, acl: acl})
			.then(function(response) {
				updateAclDB(key, acl);
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		// Database ACL Update
		function updateAclDB(key, acl) {
			filesService.updateACL({key: key, acl: acl})
			.then(function(response) {
				vm.resultButton = 'success';
				vm.file.acl = acl
			}, function(err) {
				vm.resultButton = 'error';
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

	}

})();