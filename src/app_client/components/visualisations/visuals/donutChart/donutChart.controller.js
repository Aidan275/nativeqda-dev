/**
* @author Ben Rogers <bjr342@uowmail.edu.au>
* @ngdoc controller
* @name visualisation.controller:donutChartCtrl
* @description Controller for the donut chart visualisation
*/
(function () {

	angular
	.module('visualisations')
	.controller('donutChartCtrl', donutChartCtrl);

	/* @ngInject */
	function donutChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;
		var responseData = [];

		analysisData = [];
		var sortData = [];

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'donut-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisId) //gets id from url
			.then(function(data) {	
			switch (analysisType) {
				case 'concepts':
					data.concepts.forEach(function(concept){
						var relevance = concept.relevance*100;
						var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);  // Capitalise first letter 
						responseData.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
					});
					sortRelevance(); 
					checkLength();
				break;
				case 'keywords':
					data.keywords.forEach(function(keyword){
						var relevance = keyword.relevance*100;
						var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);  // Capitalise first letter
						responseData.push({relevance: keyword.relevance, text: text});
					});

					sortRelevance();
					checkLength();
				break;
      		}
      		
				
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'donut-chart'});	// If error, stop animated loading overlay
			}); 
		}

	    /**
	    * @ngdoc function
	    * @name checkLength
	    * @methodOf visualisation.controller:donutChartCtrl
	    * @description Checks if there are more than 10 elements to be drawn, if so it trims
	    * and will take the top 10 elements and then reverse them so they are in descending order.
	    * This functinon is called when drawing a keyword or concept analysis, the function then calls the drawChart function
	    */
	    function checkLength() {
	      if(responseData.length > 10) {
	        sortData = responseData.slice((responseData.length-10), responseData.length);
	        sortData.reverse();
	        drawChart(sortData);                    
	      }else {
	        responseData.reverse();
	        drawChart(responseData);
	      } 
	    }

	    /**
	    * @ngdoc function
	    * @name sortRelevance
	    * @methodOf visualisation.controller:donutChartCtrl
	    * @description Function sorts the analysis data in ascending order on relevance. Function is used
	    * when drawing keyword and concept analysis
	    * @returns {array} The sorted array
	    */    
	    function sortRelevance() {
	      responseData.sort(function (a, b) {
	        return a.relevance - b.relevance;
	      });
	    }

	    function roundUp() {

	    }

		function drawChart(data) {


			var width = 960;
			var height = 450;
			var thickness = 40;
			var duration = 750;

			var radius = Math.min(width, height) / 2;
			var color = d3.scaleOrdinal(d3.schemeCategory10);

			var svg = d3.select("#chart")
			.append('svg')
			.attr('class', 'pie')
			.attr('width', width)
			.attr('height', height);

			var g = svg.append('g')
			.attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

			var arc = d3.arc()
				.innerRadius(radius - thickness)
				.outerRadius(radius);

			var pie = d3.pie()
				.value(function(d) { return d.relevance; })
				.sort(null);			

			var path = g.selectAll('path')
			.data(pie(data))
			.enter()
			.append("g")
			.on("mouseover", function(d) {
			      let g = d3.select(this)
			        .style("cursor", "pointer")
			        .style("fill", "black")
			        .append("g")
			        .attr("class", "text-group");
			 
			      g.append("text")
			        .attr("class", "name-text")
			        .text(`${d.data.text}`)
			        .attr('text-anchor', 'middle')
			        .attr('dy', '-1.2em');
			  
			      g.append("text")
			        .attr("class", "value-text")
			        .text(`${d.data.relevance}`)
			        .attr('text-anchor', 'middle')
			        .attr('dy', '.6em');
			    })
			  .on("mouseout", function(d) {
			      d3.select(this)
			        .style("cursor", "none")  
			        .style("fill", color(this._current))
			        .select(".text-group").remove();
			    })
			  .append('path')
			  .attr('d', arc)
			  .attr('fill', (d,i) => color(i))
			  .on("mouseover", function(d) {
			      d3.select(this)     
			        .style("cursor", "pointer")
			        .style("fill", "black");
			    })
			  .on("mouseout", function(d) {
			      d3.select(this)
			        .style("cursor", "none")  
			        .style("fill", color(this._current));
			    })
			  .each(function(d, i) { this._current = i; });


			g.append('text')
			  .attr('text-anchor', 'middle')
			  .attr('dy', '.35em')
			  .text(data.text);
		/*
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
			*/
		}
	}

})();
