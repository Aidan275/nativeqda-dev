(function () {

	angular
	.module('nativeQDAApp')
	.controller('barChartCtrl', barChartCtrl);

	/* @ngInject */
	function barChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		// Scrolls to the top of the page
		document.body.scrollTop = 0; // For Chrome, Safari and Opera 
	    document.documentElement.scrollTop = 0; // For IE and Firefox

		
	    //Chart variables
		var analysisType = $routeParams.type; 
		var analysisID = $routeParams.id;
		var responseData = {};
		var data = [];
		vm.cols = [];

		//var width = document.querySelector("#graph").clientWidth;
	    //var height = document.querySelector("#graph").clientHeight;

	    //Initialise max and min
	    var maxRelevance = 0;
	    var minRelevance = 100;
	
		var dataNodes = [];
		var data;
		activate();
		

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bubble-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			.then(function(response) {
				var analysisData = response.data; //store watson response in analysisData
				console.log(analysisData);	//Show data being used in console
				
				analysisData.concepts.forEach(function(concept){
					
					//Get name of concept, set relevance and add it to list of data
					var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);	// Capitalise first letter
					maxRelevance = (concept.relevance > maxRelevance ? concept.relevance : maxRelevance);
					minRelevance = (concept.relevance < minRelevance ? concept.relevance : minRelevance);
					dataNodes.push({text: text, radius: concept.relevance*100, relevance: concept.relevance, dbpedia_resource: concept.dbpedia_resource});

				});
				
				
				//Set data to information gathered in dataNodes
				data = {nodes: dataNodes};
				//console.log(data);
				drawChart(data);

			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function drawChart(data) {
		
		
		var margin = {top: 20, right: 20, bottom: 3, left: 40},
			width = 960- margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

		

		//Converts number to decimal percentage format so 0.11 is converted to 11%
		var formatPercent = d3.format(".0%");

		//Ordinal scale function for x-axis data
		//Scale goes from 0 to width of inner drawing space
		//Uses rangeRoundBands to set the bands
		var x = d3.scaleBand()
			.rangeRound([0, width])
			.padding(0,1); //.1 is padding added to offset bands

		//Linear scale function for y-axis
		//Range goes from height of inner drawing space to 0, this inverts so origin is at bottom left
		var y = d3.scaleLinear()
			.range([height, 0]);

		
		/*
		//Pass in x scale function and give orientation
		var xAxis = d3.svg.axis()
			.scale(x) //Now contains x-scale function
			.orient("bottom"); //Text will be below the line

		//Create y-axis same way
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(formatPercent);
		*/ 

		//Creates SVG variable which defines area of drawing
		var svg = d3.select("body").append("svg") //selects body and appends svg container
			.attr("width", width + margin.left + margin.right) //define width of container
			.attr("height", height + margin.top + margin.bottom) //define height of container
		.append("g") //appends inner drawing space ?maybe
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		
		//Get the data
		
		//Scale the range of the data in domains
		
		x.domain(d3.extent(data, function(d) {return d.x;}));
		y.domain([0, d3.max(data, function(d) {return d.y;})]);

		console.log(x.domain);

		svg.selectAll(".bar")
			.data(data)
		 .enter().append("rect")
		 	.attr("class", "bar")
		 	.attr("x", function(d) {return x(d.x);})
		 	.attr("width", x.bandwidth())
		 	.attr("y", function(d) {return y(d.y);})
		 	.attr("height", function(d) {return height - y(d.y);})

		//add the x axis
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		//add the y axis
		svg.append("g")
			.call(d3.axisLeft(y));

		
		
		}
	}

})();
