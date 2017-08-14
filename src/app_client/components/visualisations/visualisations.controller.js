(function () {

	angular
	.module('nativeQDAApp')
	.controller('visualisationsCtrl', visualisationsCtrl);

	/* @ngInject */
	function visualisationsCtrl ($routeParams, $window, analysisService, s3Service, bsLoadingOverlayService) {
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
			bsLoadingOverlayService.start({referenceId: 'visuals-info'});
			analysisService.readWatsonAnalysis(vm.analysisID)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'visuals-info'});
				vm.analysisData = response.data;
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			s3Service.signDownloadKey(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

	}

})();
