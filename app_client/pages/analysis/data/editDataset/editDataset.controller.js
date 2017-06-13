(function () {

	angular
	.module('nativeQDAApp')
	.controller('editDatasetCtrl', editDatasetCtrl);

	editDatasetCtrl.$inject = ['$uibModalInstance', 'datasets'];
	function editDatasetCtrl ($uibModalInstance, datasets) {
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