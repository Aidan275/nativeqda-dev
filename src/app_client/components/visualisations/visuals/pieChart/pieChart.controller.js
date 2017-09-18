(function () {

	angular
	.module('visualisations')
	.controller('pieChartCtrl', pieChartCtrl);

	/* @ngInject */
	function pieChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;

		var analysisData = [];
		var responseData = [];

		activate();
		
		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'pie-chart'});	// Start animated loading overlay
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
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

	    /**
	    * @ngdoc function
	    * @name checkLength
	    * @methodOf visualisation.controller:pieChartCtrl
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
	    * @methodOf visualisation.controller:pieChartCtrl
	    * @description Function sorts the analysis data in ascending order on relevance. Function is used
	    * when drawing keyword and concept analysis
	    * @returns {array} The sorted array
	    */    
	    function sortRelevance() {
	      responseData.sort(function (a, b) {
	        return a.relevance - b.relevance;
	      });
	    }

		function drawChart(data) {
			
			var svg = d3.select("svg"),
			margin = {top: 20, right: 20, bottom: 200, left: 40},
			width = +svg.attr("width") - margin.left - margin.right,
			height = +svg.attr("height") - margin.top - margin.bottom+30, 
			radius = Math.min(width, height) / 2,
			g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			var tooltip = d3.select("body").append("div").attr("class", "toolTip");

			var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

			var pie = d3.pie()
			.sort(null)
			.value(function(d) { return d.relevance; });

			var outerRadius = radius - 10;
			var innerRadius = 0;
			var path = d3.arc()
			.outerRadius(outerRadius)
			.innerRadius(innerRadius);	

			var label = d3.arc()
			.outerRadius(radius - 40)
			.innerRadius(radius - 40);

			var arc = g.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("class", "arc")
			.attr("transform", "translate(" + outerRadius + "," + innerRadius + ")")
			.on("mousemove", function(d){
				tooltip
				.style("left", d3.event.pageX - 20 + "px")
				.style("top", d3.event.pageY - 40 + "px")
				.style("display", "inline-block")
				.html((d.text) + "<br>" + (d.relevance) + "%");
			})
			.on("mouseout", function(d){ tooltip.style("display", "none");});

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
