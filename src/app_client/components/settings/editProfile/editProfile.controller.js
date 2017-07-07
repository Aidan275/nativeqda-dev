(function () { 

	angular
	.module('nativeQDAApp')
	.controller('editProfileCtrl', editProfileCtrl);
	
	/* @ngInject */
	function editProfileCtrl($uibModalInstance) {
		var vm = this;

		
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