(function () {

	angular
	.module('nativeQDAApp')
	.controller('treemapChartCtrl', treemapChartCtrl);

	/* @ngInject */
	function treemapChartCtrl ($routeParams, analysisService) {
		var vm = this;

		var analysisType = $routeParams.type;
		var id = $routeParams.id;

		var analysisData = {};

		analysisService.readWatsonAnalysis(id)
		.then(function(response) {
			analysisData = response.data.keywords;
			console.log(analysisData);
		});

	}

})();
