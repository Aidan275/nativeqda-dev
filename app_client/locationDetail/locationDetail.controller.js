(function () {

	angular
	.module('nativeQDAApp')
	.controller('locationDetailCtrl', locationDetailCtrl);

	locationDetailCtrl.$inject = ['$routeParams', '$location', '$uibModal', 'nativeQDAData', 'authentication'];
	function locationDetailCtrl ($routeParams, $location, $uibModal, nativeQDAData, authentication) {
		var vm = this;
		vm.locationid = $routeParams.locationid;

		vm.isLoggedIn = authentication.isLoggedIn();

		vm.currentPath = $location.path();
		nativeQDAData.locationById(vm.locationid)
		.then(function(response) {
			var data = response.data;
			vm.data = { location: data };
			vm.pageHeader = {
				title: vm.data.location.name
			};
		}, function (e) {
			console.log(e);
		});

		vm.popupReviewForm = function () {
			var modalInstance = $uibModal.open({
				templateUrl: '/reviewModal/reviewModal.view.html',
				controller: 'reviewModalCtrl as vm',
				resolve: {
					locationData: function () {
						return {
							locationid: vm.locationid,
							locationName: vm.data.location.name
						};
					}
				}
			});
			
			modalInstance.result.then(function (data) {
				vm.data.location.reviews.push(data);
			});
		};
	}

})();

