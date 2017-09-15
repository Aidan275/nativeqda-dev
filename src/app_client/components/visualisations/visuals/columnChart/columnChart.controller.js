(function () {

	angular
	.module('components.visualisations')
	.controller('columnChartCtrl', columnChartCtrl);

	/* @ngInject */
	function columnChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisID = $routeParams.id;
		var responseData = {};
		var data = [];
		vm.cols = [];
	
		//var data;
		activate();
		

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'column-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			
			.then(function(response) {
			vm.analysisData = response.data;
			var data = [];

			if(analysisType === 'entities'){
				response.data.entities.forEach(function(entry) {
					if(entry.emotion) {
						var emotionEntry = [
						{axis: "Anger", value: entry.emotion.anger, text: entry.text},
						{axis: "Disgust", value: entry.emotion.disgust},
						{axis: "Fear", value: entry.emotion.fear},
						{axis: "Joy", value: entry.emotion.joy},
						{axis: "Sadness", value: entry.emotion.sadness}
						];

						data.push(emotionEntry);
					}
				});
			} else if(analysisType === 'keywords'){
				response.data.keywords.forEach(function(entry) {
					if(entry.emotion) {
						var emotionEntry = [
						{axis: "Anger", value: entry.emotion.anger, text: entry.text},
						{axis: "Disgust", value: entry.emotion.disgust},
						{axis: "Fear", value: entry.emotion.fear},
						{axis: "Joy", value: entry.emotion.joy},
						{axis: "Sadness", value: entry.emotion.sadness}
						];

						data.push(emotionEntry);
					}
				});
			}
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
			
		var width = 960,
    		height = 500,
    		radius = Math.min(width, height) / 2;

		var color = d3.scaleOrdinal()
    						.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

		var arc = d3.arc()
    					.outerRadius(radius - 10)
    					.innerRadius(radius - 70);

		var pie = d3.pie()
    				.sort(null)
    				.value(function(d) { return d.relevance; });

		var svg = d3.select("body").append("svg")
    				.attr("width", width)
    				.attr("height", height)
  					.append("g")
    				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


  		var g = svg.selectAll(".arc")
      				.data(pie(data))
    				.enter().append("g")
      				.attr("class", "arc");

  		g.append("path")
      		.attr("d", arc)
      		.style("fill", function(d) { return color(d.data.text); });

  		g.append("text")
      		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      		.attr("dy", ".35em")
      		.text(function(d) { return d.data.text; });



		}
	}

})();
