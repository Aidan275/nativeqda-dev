(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewFileCtrl', viewFileCtrl);

	viewFileCtrl.$inject = ['$uibModalInstance', '$window', 'key', 'filesService'];
	function viewFileCtrl ($uibModalInstance, $window, key, filesService) {
		var vm = this;
		vm.updateAcl = updateAcl;
		vm.viewFile = viewFile;
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.makePublicOptions = { buttonDefaultText: 'Make Public' };
		vm.makePrivateOptions = { buttonDefaultText: 'Make Private' };

		activate();

    	///////////////////////////

    	function activate() {
    		filesService.fileReadOneDB(key)
    		.then(function(response) {
    			vm.file = response.data;
    			vm.acl = vm.file.acl;
    		}, function (e) {
    			console.log(e);
    		});
    	}		

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				var signedURL = response.data;
				$window.open(response.data, '_blank');
			}, function(err) {
				console.log(err);
			});
		}

		function updateAclDB(key, acl) {
			filesService.objectAclDB({key: key, acl: acl})
			.then(function(response) {
				vm.resultButton = 'success';
				vm.acl = acl
			}, function(err) {
				vm.resultButton = 'error';
				console.log(err);
			});
		}

		function updateAcl(key, acl) {
			vm.isSubmittingButton = true;
			filesService.objectAclS3({key: key, acl: acl})
			.then(function(response) {
				updateAclDB(key, acl);
			}, function(err) {
				vm.resAclBtn = 'error';
				console.log(err);
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