(function () {

	angular
	.module('nativeQDAApp')
	.controller('testWatsonCtrl', testWatsonCtrl);

	testWatsonCtrl.$inject = ['analysisService', '$scope'];
	function testWatsonCtrl (analysisService, $scope) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;

		// Bindable Data
		vm.analysisURL = null;
		vm.responseData = null;
		vm.pageHeader = {
			title: 'Test Analysis',
			strapline: "Using IMB's Watson API"
		};

		///////////////////////////

		function onSubmit() {
			analysisService.watsonAnalysis({url: vm.analysisURL})
			.then(function(response) {
				vm.responseData = response.data;
				console.log(response);
			});
		}
	}

})();
