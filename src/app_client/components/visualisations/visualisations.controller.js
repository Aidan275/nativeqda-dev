(function () {

	angular
	.module('nativeQDAApp')
	.controller('visualisationsCtrl', visualisationsCtrl);

	/* @ngInject */
	function visualisationsCtrl ($routeParams, $window, analysisService, filesService) {
		var vm = this;

		// Bindable Functions
		vm.viewFile = viewFile;

		// Bindable Data
		vm.analysisID = $routeParams.id;
		vm.analysisData = {};
		vm.pageHeader = {
			title: 'Visualisations'
		};

		activate();

		///////////////////////////

		function activate() {
			getAnalysisData();
		}

		function getAnalysisData() {
			analysisService.readConceptAnalysis(vm.analysisID)
			.then(function(response) {
				vm.analysisData = response.data;
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

	}

})();
