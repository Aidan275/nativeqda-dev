(function () {

	angular
	.module('nativeQDAApp')
	.controller('pieChartCtrl', pieChartCtrl);

	/* @ngInject */
	function pieChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisID = $routeParams.id;
		var responseData = {};
		//var data = [];
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
					var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);	// Capitalise first letter
					data.push({relevance: keyword.relevance, text: text});
				});
				
				
				drawChart(data);
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
			

			var svg = d3.select("svg"),
    		width = +svg.attr("width"),
    		height = +svg.attr("height"),
    		radius = Math.min(width, height) / 2,
    		g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

			var pie = d3.pie()
    				.sort(null)
    				.value(function(d) { return d.relevance; });

			var path = d3.arc()
    				.outerRadius(radius - 10)
    				.innerRadius(0);

			var label = d3.arc()
    				.outerRadius(radius - 40)
    				.innerRadius(radius - 40);

  			var arc = g.selectAll(".arc")
    				.data(pie(data))
    				.enter().append("g")
      				.attr("class", "arc");

  			arc.append("path")
      				.attr("d", path)
      				.attr("fill", function(d) { return color(d.data.text); });

  			arc.append("text")
      				.attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      				.attr("dy", "0.35em")
      				.text(function(d) { return d.data.age; });


		}
	}

})();
