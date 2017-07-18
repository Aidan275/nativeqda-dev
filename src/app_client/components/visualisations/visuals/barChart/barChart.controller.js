(function () {

	angular
	.module('nativeQDAApp')
	.controller('barChartCtrl', barChartCtrl);

	/* @ngInject */
	function barChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisID = $routeParams.id;
		var responseData = {};
		var data = [];
		vm.cols = [];
	
		var data;
		activate();
		

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bubble-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			.then(function(response) {
				var analysisData = response.data; //store watson response in analysisData
				//console.log(analysisData);
				
				analysisData.keywords.forEach(function(keyword){
					var relevance = keyword.relevance*100;
					
					data.push(relevance);
				});
				
				
				drawChart(data);
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
			
			
		d3.select(".chart")
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.style("width", function(d) {return d + "px";})
			.text(function(d) {return d;});
		}
	}

})();
