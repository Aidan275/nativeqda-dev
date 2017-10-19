/**
* @author Ben Rogers
* @email bjr342@uowmail.edu.au
* @ngdoc controller
* @name visualisations.controller:barChartCtrl
* @description Controller for the bar chart visualisation
*/

(function () {

	angular
	.module('visualisations')
	.controller('barChartCtrl', barChartCtrl);

	/* @ngInject */
	function barChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;

		var responseData = [];
		var isMobile = false;
		var sortData = [];
		vm.cols = [];

		/* Bindable functions */
		vm.top10 = top10;
		vm.bottom10 = bottom10;
		vm.setBarColour = setBarColour;
		vm.toggleOptions = toggleOptions;

		var slideout = new Slideout({
			'panel': document.querySelector('#barPanel'),
			'menu': document.querySelector('#barMenu'),
			'padding': 256,
			'tolerance': 70
		});

		var width = document.querySelector("#graph").clientWidth;
		var height = document.querySelector("#graph").clientHeight;

		var svg = d3.select("#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "graph-svg-component")
		.call(
			d3.zoom()
			.scaleExtent([0.5, 10])
			.translateExtent([[-width/2, -height/2], [width*1.5, height*1.5]])
			.on("zoom", function () {
				svg.attr("transform", d3.event.transform)
			}))
		.append("g");

		activate();

		/**
		* @ngdoc function
		* @name activate
		* @methodOf visualisations.controller:barChartCtrl
		* @description Gets data to draw the bar chart for either concepts, entities or keywords
		*/
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bar-chart'});  /*  Start animated loading overlay */
			analysisService.readWatsonAnalysis(analysisId) /* gets id from url */
			.then(function(data) {
				var analysisData = data; /* store watson response in analysisData */

				switch (analysisType) {
					case 'concepts':
					analysisData.concepts.forEach(function(concept){
						var relevance = concept.relevance*100;
						var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);  /*  Capitalise first letter  */
						responseData.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
					});
					sortRelevance(); 
					checkLength();
					break;
					case 'entities':
					analysisData.entities.forEach(function(entity){
						var count = entity.count;
						var text = entity.text;
						responseData.push({count: entity.count, text: text});
					});
					sortCount();
					responseData.reverse();
					drawEntityChart(responseData);
					break;
					case 'keywords':
					analysisData.keywords.forEach(function(keyword){
						var relevance = keyword.relevance*100;
						var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);  /*  Capitalise first letter */
						responseData.push({relevance: keyword.relevance, text: text});
					});
					sortRelevance();
					checkLength();
					break;
				}



			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bar-chart'}); /*  If error, stop animated loading overlay */
			}); 
		}

		/**
		* @ngdoc function
		* @name checkLength
		* @methodOf visualisations.controller:barChartCtrl
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
		* @methodOf visualisations.controller:barChartCtrl
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
		* @name sortCount
		* @methodOf visualisations.controller:barChartCtrl
		* @description Function sorts the analysis data in ascending order on count. Function is used
		* when drawing entity analysis
		* @returns {array} The sorted array
		*/ 
		function sortCount() {
			responseData.sort(function (a, b) {
				return a.count - b.count;
			}); 
		}

		function toggleOptions() {
			slideout.toggle();
		}

		function top10() {
			/* Visualisation is already showing the top 10 in descending order */
			/* Call this  */
			sortRelevance(); /* Sort them in ascending order */
			sortData = responseData.slice(0, 10); /* Grab first 10 elements */
			redraw(sortData);
		}

		function bottom10() {
			sortRelevance();
			sortData = responseData.slice(0, 10);
			redraw(sortData);
		}


		var g;

		/**
		* @ngdoc function
		* @name drawChart
		* @methodOf visualisations.controller:barChartCtrl
		* @description Function takes the trimmed and sorted data and using d3 draws a bar chart on relevance
		* function is called when drawing keyword and concept analysis
		* @param {object} data An object consisting of
		*
		* relevance: A score of how relevant the keyword or concept is  
		* text: The name of the element  
		* dbpedia_resource: A link to dbpedias page on the resource
		*/
		function drawChart(data) {

			var tooltip = d3.select("#barPanel").append("div")	
			.attr("class", "bar-chart-tooltip")				
			.style("opacity", 0)
			.style("background", "#fff")
			.style("padding", "10px")
			.style("border-radius", "10px")
			.style("font-weight", 600);

			/* Set the x and y ranges */
			var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
			y = d3.scaleLinear().rangeRound([height, 0]);

			var colours = d3.scaleOrdinal()
			.range(["#6F257F", "CA0D59"]);

			g = svg.append("g")
			.attr("transform", "translate(" + width/3 + ", " + height/4 + ") scale(0.4)")

			/* Sets the domain, x is text and y is relevance */
			x.domain(data.map(function(d) { return d.text; }));
			y.domain([0, d3.max(data, function(d) { return d.relevance; })]);

			/* Appends graph to body of the page */
			/* Append x axis */
			g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x).ticks(10))
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-65)");

			/* Add the y axis */
			g.append("g")
			.attr("class", "axis axis--y")
			.call(d3.axisLeft(y).ticks(10, "%"))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Relevance");

			/* Append rectangles for the bar chart */
			g.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.text); })
			.attr("y", function(d) { return y(d.relevance); })
			.attr("width", x.bandwidth())
			.attr("height", function(d) { return height - y(d.relevance);})
			.attr("fill", function(d) { return colours(d.area); })
			.on("mousemove", function(d){
				tooltip.transition()		
				.duration(200)		
				.style("opacity", .9);

				tooltip.html((d.text) + "<br>" + d3.format(".2%")(d.relevance))
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
		}

		vm.barColourChange = { onChange: function() {setBarColour(); } };
		vm.textColourChange = { onChange: function(api, color, $event) {svg.selectAll("text").style("fill", color);} };


		function setBarColour() {
			var colours = d3.scaleOrdinal()
			.range([vm.barColour, vm.barColour]);

			svg.selectAll(".bar").style("fill", function(d) {return colours(d.relevance)});      
		}

		/**
		* @ngdoc function
		* @name drawEntityChart
		* @methodOf visualisations.controller:barChartCtrl
		* @description Function takes the trimmed and sorted data and using d3 draws a bar chart on relevance
		* function is called when drawing keyword and concept analysis
		* @param {object} data An object consisting of
		*
		* count: A score of how many times the entity was mentioned  
		* text: The name of the element
		*/
		function drawEntityChart(data) {

			var tooltip = d3.select("#barPanel").append("div")	
			.attr("class", "bar-chart-tooltip")				
			.style("opacity", 0)
			.style("background", "#fff")
			.style("padding", "10px")
			.style("border-radius", "10px")
			.style("font-weight", 600);

			/* Set the x and y ranges */
			var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
			y = d3.scaleLinear().rangeRound([height, 0]);

			var colours = d3.scaleOrdinal()
			.range(["#6F257F", "CA0D59"]);

			g = svg.append("g")
			.attr("transform", "translate(" + width/3 + ", " + height/4 + ") scale(0.4)")

			/* Sets the domain, x is text and y is count */
			x.domain(data.map(function(d) { return d.text; }));
			y.domain([0, d3.max(data, function(d) { return d.count; })]);

			/* Appends graph to body of the page */
			/* Append x axis */
			g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x).ticks(5))
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-65)");

			/* Add the y axis */
			g.append("g")
			.attr("class", "axis axis--y")
			.call(d3.axisLeft(y).ticks(10))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Relevance");

			/* Append rectangles for the bar chart */
			g.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.text); })
			.attr("y", function(d) { return y(d.count); })
			.attr("width", x.bandwidth())
			.attr("height", function(d) { return height - y(d.count);})
			.attr("fill", function(d) { return colours(d.area); })
			.on("mousemove", function(d){
				tooltip.transition()		
				.duration(200)		
				.style("opacity", .9);

				tooltip.html((d.text) + "<br>" + (d.count))
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
		}
	}

})();