(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('markerDependencyCtrl', markerDependencyCtrl);

	/* @ngInject */
	function markerDependencyCtrl($uibModalInstance, markers, logger, mapService, authentication) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.currentUser = authentication.currentUser();
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
				name: vm.formData.name,
				description: vm.formData.description,
				createdBy: vm.currentUser.firstName,
				userID: vm.currentUser._id,
				precedent: markers.precedent,
				dependent: markers.dependent
			};
			console.log(link);
			mapService.putLink(link)
			.then(function(response){
				logger.success("The dependecy has been save", "", "Success");
				vm.modal.close(response.data);	/* Close modal if the link was successfully saved and return the new link data */
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