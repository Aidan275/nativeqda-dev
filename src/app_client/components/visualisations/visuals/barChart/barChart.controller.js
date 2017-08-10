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
		var sortData = [];
		vm.cols = [];
		//var sortBy = require('sort-by'), data = [];
		//var data;
		activate();
		

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bar-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			.then(function(response) {
				var analysisData = response.data; //store watson response in analysisData

				if(analysisType === 'concepts') {
					analysisData.concepts.forEach(function(concept){
						var relevance = concept.relevance*100;
						var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);	// Capitalise first letter
						//var trimText = text.substring(0, 6); 
						data.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
					
					});
				}else if (analysisType === 'keywords'){
					analysisData.keywords.forEach(function(keyword){
						var relevance = keyword.relevance*100;
						var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);	// Capitalise first letter
						//var trimText = text.substring(0, 10); 
						data.push({relevance: keyword.relevance, text: text});
					});
				}

				//Sort data by relevance
				data.sort(function (a, b) {
					return a.relevance - b.relevance;
				});
				
				//If there are too many entities the graph becomes unusable
				if(data.length > 15) {
					sortData = data.slice(0, 15); //Take first 10 elements
					drawChart(sortData);										

				}else {
					drawChart(data);
				} 
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
			
			//Set the drawing space for the graph
			var svg = d3.select("svg"),
				margin = {top: 20, right: 20, bottom: 70, left: 40},
    			width = +svg.attr("width") - margin.left - margin.right,
    			height = +svg.attr("height") - margin.top - margin.bottom; 
			
    		//Set the x and y ranges
    		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    			y = d3.scaleLinear().rangeRound([height, 0]);

    		//var formatTime = d3.timeFormat("%e ")

    		var div = d3.select("body").append("div")
    			.attr("class", "tooltip");

    		//Set margins
			var g = svg.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    		//Sets the domain, x is text and y is relevance
    		x.domain(data.map(function(d) { return d.text; }));
    		y.domain([0, d3.max(data, function(d) { return d.relevance; })]);

    		//Appends graph to body of the page
    		g.append("g")
      			.attr("class", "axis axis--x")
      			.attr("transform", "translate(0," + height + ")")
      			.call(d3.axisBottom(x).ticks(10))
      			.selectAll("text")
      				.style("text-anchor", "end")
      				.attr("dx", "-.8em")
      				.attr("dy", ".15em")
      				.attr("transform", "rotate(-65)");


      		//Add the x axis
      		g.append("g")
      			.attr("class", "axis axis--y")
      			.call(d3.axisLeft(y).ticks(10, "%"))
    			.append("text")
      			.attr("transform", "rotate(-90)")
      			.attr("y", 6)
      			.attr("dy", "0.71em")
      			.attr("text-anchor", "end")
      			.text("Relevance");

      		//Append rectangles for the bar chart
      		 g.selectAll(".bar")
    			.data(data)
    			.enter().append("rect")
      			.attr("class", "bar")
      			.attr("x", function(d) { return x(d.text); })
      			.attr("y", function(d) { return y(d.relevance); })
      			.attr("width", x.bandwidth())
      			.attr("height", function(d) { return height - y(d.relevance);})
      			.on("mouseover", function(d) {
      				div.transition()
      					.duration(200)
      					.style("opacity", .9);
      				div.html(d.text + "<br/>" + d.relevance)
      					.style("left", (d3.event.pageX) + "px")
      					.style("top", (d3.event.pageY - 28) + "px");
      				})
      			.on("mouseout", function(d) {
      				div.transition()
      					.duration(500)
      					.style("opacity", 0);
      			});
      			
      			




		}
	}

})();
