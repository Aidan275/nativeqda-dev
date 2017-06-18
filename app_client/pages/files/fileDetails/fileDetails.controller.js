(function () {

	angular
	.module('nativeQDAApp')
	.controller('fileDetails', fileDetails);

	fileDetails.$inject = ['$uibModalInstance', '$window', 'key', 'filesService'];
	function fileDetails ($uibModalInstance, $window, key, filesService) {
		var vm = this;

		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.makePublicOptions = { buttonDefaultText: 'Make Public' };
		vm.makePrivateOptions = { buttonDefaultText: 'Make Private' };

		vm.updateAclS3 = updateAclS3;

		activate();

    	///////////////////////////

    	function activate() {
    		filesService.fileReadOneDB(key)
    		.then(function(response) {
    			vm.file = response.data;
    		});
    	}		

		// Updates the Access Control List so the file is either private or public
		// There are other options also avaliable - check aws-sdk js api documentation
		// S3 ACL Update - if successful, update database ACL
		function updateAclS3(key, acl) {
			vm.isSubmittingButton = true;
			filesService.objectAclS3({key: key, acl: acl})
			.then(function(response) {
				updateAclDB(key, acl);
			}, function(err) {
				vm.resAclBtn = 'error';
			});
		}

		// Database ACL Update
		function updateAclDB(key, acl) {
			filesService.objectAclDB({key: key, acl: acl})
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