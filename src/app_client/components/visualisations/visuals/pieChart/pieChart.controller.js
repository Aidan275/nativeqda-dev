/**
* @author Ben Rogers
* @email bjr342@uowmail.edu.au
* @ngdoc controller
* @name visualisations.controller:pieChartCtrl
* @description Controller for the donut chart visualisation
*/

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

		var slideout = new Slideout({
      		'panel': document.querySelector('#piePanel'),
      		'menu': document.querySelector('#pieMenu'),
      		'padding': 256,
      		'tolerance': 70
    	});

    	vm.toggleOptions = toggleOptions;

    	var width = document.querySelector("svg").clientWidth;
		var height = document.querySelector("svg").clientHeight;
		var radius = Math.min(width, height) / 2;

    	var svg = d3.select("svg")
    		.attr("width", width)
    		.attr("height", height)
    		.attr("radius", radius)
    		.attr("class", "chart-svg-component")
    		.call(
				d3.zoom()
				.scaleExtent([0.5, 10])
				.translateExtent([[-width/2, -height/2], [width*1.5, height*1.5]])
				.on("zoom", function () {
					svg.attr("transform", d3.event.transform)
				}))
			.append("g");
		///////////////////////////


		/**
		* @ngdoc function
		* @name activate
		* @methodOf visualisations.controller:pieChartCtrl
		* @description Gets data to draw the pie chart for either concepts or keywords
		*/
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

		function toggleOptions() {
      		slideout.toggle();
    	}

	    /**
	    * @ngdoc function
	    * @name checkLength
	    * @methodOf visualisations.controller:pieChartCtrl
	    * @description Checks if there are more than 10 elements to be drawn, if so it trims
	    * and will take the top 10 elements and then reverse them so they are in descending order.
	    * This functinon is called when drawing a keyword or concept analysis, the function then calls the drawChart function
	    */
	    function checkLength() {
	      if(responseData.length > 10) {
	        sortData = responseData.slice((responseData.length-10), responseData.length);
	        sortData.reverse();
	        roundUp(sortData);                   
	      }else {
	        responseData.reverse();
	        roundUp(responseData);
	      } 
	    }

	    /**
	    * @ngdoc function
	    * @name sortRelevance
	    * @methodOf visualisations.controller:pieChartCtrl
	    * @description Function sorts the analysis data in ascending order on relevance. Function is used
	    * when drawing keyword and concept analysis
	    * @returns {array} The sorted array
	    */    
	    function sortRelevance() {
	      responseData.sort(function (a, b) {
	        return a.relevance - b.relevance;
	      });
	    }

	    /**
	    * @ngdoc function
	    * @name roundUp
	    * @methodOf visualisations.controller:pieChartCtrl
	    * @description Function takes each objects relevance, calculates the sum of them and then makes
	    * each relevance value a percentage
	    * @returns {array} The sorted array
	    */ 
	    function roundUp(data) {
	    	//Add up to get total
	    	var total = 0;
	    	var myTmp = [];
	    	var i = 0;

	    	//Find total
	    	data.forEach(function (object){
	    		total = total + object.relevance;
	    		myTmp[i] = object.relevance;
	    		i++;
	    	});


	    	//Get percentages for each
	    	i = 0;
	    	data.forEach(function (object){
	    		myTmp[i] = total/object.relevance;
	    		object.relevance = myTmp[i];
	    		i++;
	    	});

	    	drawChart(data);
	    }

		/**
		* @ngdoc function
		* @name drawChart
		* @methodOf visualisations.controller:pieChartCtrl
		* @description Function takes the trimmed and sorted data and using d3 draws a pie chart on relevance
		* function is called when drawing keyword and concept analysis
		* @param {object} data An object consisting of
		*
		* relevance: A score of how relevant the keyword or concept is  
		* text: The name of the element  
		* dbpedia_resource: A link to dbpedias page on the resource
		*/
		function drawChart(data) {

			//set area
			g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			var tooltip = d3.select("#piePanel").append("div")	
			.attr("class", "pie-chart-tooltip")				
			.style("opacity", 0)
			.style("background", "#fff")
			.style("padding", "10px")
			.style("border-radius", "10px")
			.style("font-weight", 600);

			//set colours
			var color = d3.scaleOrdinal(d3.schemeCategory20c);

			var pie = d3.pie()
				.sort(null)
				.value(function(d) { return d.relevance; });

			var outerRadius = radius - 10;
			var innerRadius = 0;
			
			/* Sets the radius */
			var path = d3.arc()
				.outerRadius(outerRadius)
				.innerRadius(innerRadius);	

			var label = d3.arc()
				.outerRadius(radius - 40)
				.innerRadius(radius - 40);

			/* Append the sections of the pie chart */
			var arc = g.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc")
				.attr("transform", "translate(" + outerRadius + "," + innerRadius + ")")
				.on("mousemove", function(d){
				tooltip.transition()		
				.duration(200)		
				.style("opacity", .9);

				tooltip.html((d.data.text) + "<br>" + d3.format(".2%")(d.data.relevance/100))
					.style("left", width/2 + "px")		
					.style("transform", "translate(-50%, 0)")		
					.style("top", 10 + "px")
					.style("background", "#fafafa")
					.style("border", "1px solid #000");
				})
				.on("mouseout", function(d) {		
					tooltip.transition()		
					.duration(500)		
					.delay(3000)
					.style("opacity", 0);	
				})

			arc.append("path")
				.attr("d", path)
				.attr("fill", function(d) { return color(d.data.text); });

			/* Add labels to pie */
			arc.append("text")
				.attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
				.attr("dy", "0.35em")
				.text(function(d) { return  (d.data.text); });

		}
	}

})();
