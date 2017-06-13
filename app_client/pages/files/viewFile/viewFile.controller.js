(function () {

	angular
	.module('nativeQDAApp')
	.controller('viewFileCtrl', viewFileCtrl);

	viewFileCtrl.$inject = ['$uibModalInstance', '$window', 'files', 'file'];
	function viewFileCtrl ($uibModalInstance, $window, files, file) {
		var vm = this;
		
		vm.file = file;
		vm.acl = vm.file.acl;

		// Gets signed URL to download the requested file from S3 
		// and if successful, opens the signed URL in a new tab
		vm.viewFile = function(key) {
			files.signDownloadS3(key)
			.then(function(response) {
				var signedURL = response.data;
				$window.open(response.data, '_blank');
			}, function(err) {
				console.log(err);
			});
		}

		updateAclDB = function(key, acl) {
			files.objectAclDB({key: key, acl: acl})
			.then(function(response) {
				vm.acl = acl
			}, function(err) {
				console.log(err);
			});
		}

		vm.updateAcl = function(key, acl) {
			files.objectAclS3({key: key, acl: acl})
			.then(function(response) {
				updateAclDB(key, acl);
			}, function(err) {
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