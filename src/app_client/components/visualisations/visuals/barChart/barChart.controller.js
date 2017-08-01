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
					//var text = "Hello";
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
				margin = {top: 20, right: 20, bottom: 30, left: 40},
    			width = +svg.attr("width") - margin.left - margin.right,
    			height = +svg.attr("height") - margin.top - margin.bottom; 
			
    		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    			y = d3.scaleLinear().rangeRound([height, 0]);

			var g = svg.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    		x.domain(data.map(function(d) { return d.text; }));
    		y.domain([0, d3.max(data, function(d) { return d.relevance; })]);

    		g.append("g")
      			.attr("class", "axis axis--x")
      			.attr("transform", "translate(0," + height + ")")
      			.call(d3.axisBottom(x));


      		 g.append("g")
      			.attr("class", "axis axis--y")
      			.call(d3.axisLeft(y).ticks(10, "%"))
    			.append("text")
      			.attr("transform", "rotate(-90)")
      			.attr("y", 6)
      			.attr("dy", "0.71em")
      			.attr("text-anchor", "end")
      			.text("Relevance");

      		  g.selectAll(".bar")
    			.data(data)
    			.enter().append("rect")
      			.attr("class", "bar")
      			.attr("x", function(d) { return x(d.text); })
      			.attr("y", function(d) { return y(d.relevance); })
      			.attr("width", x.bandwidth())
      			.attr("height", function(d) { return height - y(d.relevance); });
    	/*
		d3.select(".chart")
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.style("width", function(d) {return d + "px";})
			.text(function(d) {return d;});

		*/
		}
	}

})();
