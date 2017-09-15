(function () {

	angular
	.module('components.visualisations')
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
		activate();
		

    //Bindable functions
    vm.top10 = top10;
    vm.bottom10 = bottom10;
    vm.redraw = redraw;

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bar-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisID) //gets id from url
			.then(function(response) {
				var analysisData = response.data; //store watson response in analysisData

				switch (analysisType) {
					case 'categories':
					//categoriesTable();
					break;
					case 'concepts':
					conceptChart(analysisData);
					checkLength();
					break;
					case 'entities':
					entitiesChart(analysisData);
          data.reverse();
					drawEntityChart(data);
					break;
					case 'keywords':
					keywordChart(analysisData);
					checkLength();
					break;
					case 'relations':
					//relationsTable();
					break;
					case 'semantic-roles':
					//semanticRolesTable();
					break;
				}



			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'bar-chart'});	// If error, stop animated loading overlay
			}); 
		}
		function checkLength() {
			//If there are too many entities the graph becomes unusable

			if(data.length > 15) {
				sortData = data.slice((data.length-10), data.length);
        sortData.reverse();
				drawChart(sortData);										

			}else {
        data.reverse();
				drawChart(data);
			}	
		}
		
		function sortRelevance() {
			//Sort data by relevance in descending order
			data.sort(function (a, b) {
				return a.relevance - b.relevance;
			});	
		}

    function sortCount() {
      data.sort(function (a, b) {
        return a.count - b.count;
      }); 
    }

    function top10() {
      //This might not be necessary
      //Refresh drawing with only top 10 elements
      sortRelevance(); //Sort them in ascending order
      sortData = data.slice(0, 10); //Grab first 10 elements

      console.log(data);

    }

    function bottom10() {
      sortData = data.slice(0, 10);
      sortRelevance();
      console.log(data);
    }

		function conceptChart(analysisData) {
			analysisData.concepts.forEach(function(concept){
				var relevance = concept.relevance*100;
				var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);	// Capitalise first letter 
				data.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
					
			});
			sortRelevance();
		}

		function keywordChart(analysisData) {
			analysisData.keywords.forEach(function(keyword){
				var relevance = keyword.relevance*100;
				var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);	// Capitalise first letter
				data.push({relevance: keyword.relevance, text: text});
			});

			sortRelevance();
		}

		function entitiesChart(analysisData) {
			analysisData.entities.forEach(function(entity){
				var count = entity.count;
				var text = entity.text;
				data.push({count: entity.count, text: text});
			});
      //Sort by count for entities
			sortCount();

		}

		function drawChart(data) {
			
		//Set the drawing space for the graph
		var svg = d3.select("svg"),
			margin = {top: 20, right: 20, bottom: 200, left: 40},
    		width = +svg.attr("width") - margin.left - margin.right,
    		height = +svg.attr("height") - margin.top - margin.bottom+30; 
		
    		
    	var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    	//Set the x and y ranges
    	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    		y = d3.scaleLinear().rangeRound([height, 0]);

    	var colours = d3.scaleOrdinal()
    		.range(["#6F257F", "CA0D59"]);

    	//Set margins
		var g = svg.append("g")
    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    	//Sets the domain, x is text and y is relevance
    	x.domain(data.map(function(d) { return d.text; }));
    	y.domain([0, d3.max(data, function(d) { return d.relevance; })]);

    	//Appends graph to body of the page
    	//Append x axis
    	g.append("g")
      		.attr("class", "axis axis--x")
      		.attr("transform", "translate(0," + height + ")")
      		.call(d3.axisBottom(x).ticks(10))
      		.selectAll("text")
      			.style("text-anchor", "end")
      			.attr("dx", "-.8em")
      			.attr("dy", ".15em")
      			.attr("transform", "rotate(-65)");


      	//Add the y axis
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
        	.attr("fill", function(d) { return colours(d.area); })
        	.on("mousemove", function(d){
           		tooltip
           			.style("left", d3.event.pageX - 50 + "px")
           			.style("top", d3.event.pageY - 70 + "px")
           			.style("display", "inline-block")
           			.html((d.text) + "<br>" + (d.relevance) + "%");
        })
    	.on("mouseout", function(d){ tooltip.style("display", "none");});
		}

		function drawEntityChart(data) {
		//Set the drawing space for the graph
		var svg = d3.select("svg"),
			margin = {top: 20, right: 20, bottom: 200, left: 40},
    		width = +svg.attr("width") - margin.left - margin.right,
    		height = +svg.attr("height") - margin.top - margin.bottom+30; 
		
    		
    	var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    	//Set the x and y ranges
    	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    		y = d3.scaleLinear().rangeRound([height, 0]);

    	var colours = d3.scaleOrdinal()
    		.range(["#6F257F", "CA0D59"]);

    	//Set margins
		var g = svg.append("g")
    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    	//Sets the domain, x is text and y is count
    	x.domain(data.map(function(d) { return d.text; }));
    	y.domain([0, d3.max(data, function(d) { return d.count; })]);

    	//Appends graph to body of the page
    	//Append x axis
    	g.append("g")
      		.attr("class", "axis axis--x")
      		.attr("transform", "translate(0," + height + ")")
      		.call(d3.axisBottom(x).ticks(5))
      		.selectAll("text")
      			.style("text-anchor", "end")
      			.attr("dx", "-.8em")
      			.attr("dy", ".15em")
      			.attr("transform", "rotate(-65)");


      	//Add the y axis
      	g.append("g")
      		.attr("class", "axis axis--y")
      		.call(d3.axisLeft(y).ticks(10))
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
      		.attr("y", function(d) { return y(d.count); })
      		.attr("width", x.bandwidth())
      		.attr("height", function(d) { return height - y(d.count);})
        	.attr("fill", function(d) { return colours(d.area); })
        	.on("mousemove", function(d){
           		tooltip
           			.style("left", d3.event.pageX - 50 + "px")
           			.style("top", d3.event.pageY - 70 + "px")
           			.style("display", "inline-block")
           			.html((d.text) + "<br>" + (d.count));
        })
    	.on("mouseout", function(d){ tooltip.style("display", "none");});
		}
	}

  function redraw() {

  }

})();
