(function () {

	'use strict';

	angular
	.module('map')
	.controller('linkInfoCtrl', linkInfoCtrl);

	/* @ngInject */
	function linkInfoCtrl($uibModalInstance, markers, logger, mapService, authService) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.currentUser = authService.currentUser();
		vm.formData = {}

		///////////////////////////

		function onSubmit() {
			if(!vm.formData.name || !vm.formData.description) {
				logger.error('All fields required, please try again', '', 'Error');
			} else {
				saveDependecy();
			}
		}

		function saveDependecy() {
			var link = {
				_creator: vm.currentUser._id,
				name: vm.formData.name,
				description: vm.formData.description,
				precedent: markers.precedent,
				dependent: markers.dependent
			};
			mapService.putLink(link)
			.then(function(data){
				logger.success("The dependecy has been save", "", "Success");
				vm.modal.close(data);	/* Close modal if the link was successfully saved and return the new link data */
			});
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	// Return results
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();