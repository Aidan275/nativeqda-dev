(function () {

	angular
	.module('components.visualisations')
	.controller('donutChartCtrl', donutChartCtrl);

	/* @ngInject */
	function donutChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
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
			bsLoadingOverlayService.start({referenceId: 'donut-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			.then(function(response) {
				var analysisData = response.data; //store watson response in analysisData
				//console.log(analysisData);
				
				analysisData.keywords.forEach(function(keyword){
					var relevance = keyword.relevance*10;
					var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);	// Capitalise first letter
					data.push({relevance: relevance, text: text});
				});
				
				
				drawChart(data);
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'donut-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
			
		var margin = {top: 20, right: 20, bottom: 200, left: 40},
    	width = +svg.attr("width") - margin.left - margin.right,
    	height = +svg.attr("height") - margin.top - margin.bottom+30; 

    	var tooltip = d3.select("body").append("div").attr("class", "toolTip");


		var color = d3.scaleOrdinal()
    		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

		var outerRadius = radius - 10;
		var innerRadius = radius - 70;
		var arc = d3.arc()
    			.outerRadius(outerRadius)
    			.innerRadius(innerRadius);

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
      		.attr("class", "arc")
      		.attr("transform", "translate(" + outerRadius + "," + innerRadius + ")")
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.text) + "<br>" + (d.relevance));
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});

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
