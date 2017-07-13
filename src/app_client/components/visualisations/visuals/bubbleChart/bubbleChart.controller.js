(function () {

	'use strict'

	angular
	.module('nativeQDAApp')
	.controller('bubbleChartCtrl', bubbleChartCtrl);

	/* @ngInject */
	function bubbleChartCtrl ($routeParams, analysisService, bsLoadingOverlayService) {
		var vm = this;

		vm.setColour = setColour;

		var analysisType = $routeParams.type;
		var id = $routeParams.id;

		vm.analysisData = {};
		var dataNodes = [];
		var bubbleScale = 50;
		var data;

		var width = document.querySelector("#graph").clientWidth;
		var height = document.querySelector("#graph").clientHeight;
		var maxRelevance = 0;
		var minRelevance = bubbleScale;
		var minColour = ""; 
		var maxColour = "";
		var svg = d3.select("#graph").append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(d3.zoom().on("zoom", function () {
			svg.attr("transform", d3.event.transform)
		}))
		.append("g");

		vm.options = [
		{ name: "Misty Meadow", minCol: "#e4e4d9", maxCol: "#215f00" }, 
		{ name: "Kyoto", minCol: "#c21500", maxCol: "#ffc500" }, 
		{ name: "Pinot Noir", minCol: "#182848", maxCol: "#4b6cb7" }, 
		{ name: "Miake", minCol: "#0ABFBC", maxCol: "#FC354C" }, 
		{ name: "Calm Darya", minCol: "#5f2c82", maxCol: "#49a09d" },
		{ name: "Electric Violet", minCol: "#8E54E9", maxCol: "#4776E6" },
		{ name: "Sunrise", minCol: "#F09819", maxCol: "#FF512F" }
		];

		vm.selectedOption = vm.options[0];

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'bubble-chart'});
			analysisService.readWatsonAnalysis(id)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'bubble-chart'});
				vm.analysisData = response.data;
				console.log(response.data);

				if(analysisType === 'concepts') {
					vm.analysisData.concepts.forEach(function(concept){
						maxRelevance = (concept.relevance > maxRelevance ? concept.relevance : maxRelevance);
						minRelevance = (concept.relevance < minRelevance ? concept.relevance : minRelevance);
						dataNodes.push({text: concept.text, r: concept.relevance*bubbleScale, dbpedia_resource: concept.dbpedia_resource});
					});

				} else if(analysisType === 'keywords') {
					vm.analysisData.keywords.forEach(function(keyword){
						maxRelevance = (keyword.relevance > maxRelevance ? keyword.relevance : maxRelevance);
						minRelevance = (keyword.relevance < minRelevance ? keyword.relevance : minRelevance);
						dataNodes.push({text: keyword.text, r: keyword.relevance*bubbleScale});
					});

				}

				data = {nodes: dataNodes};
				drawChart(data);
			}); 
		}

		function drawChart(data) {

			var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.index }))
			.force("collide",d3.forceCollide( function(d){return d.r + 1 }).iterations(24) )
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("y", d3.forceY(0))
			.force("x", d3.forceX(0))

			var div = d3.select("body").append("div")	
			.attr("class", "tooltip")				
			.style("opacity", 0)
			.style("background", "#fff")
			.style("padding", "10px")
			.style("border-radius", "10px")
			.style("font-weight", 600);

			var node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(data.nodes)
			.enter().append("circle")
			.attr("r", function(d){  return d.r })
			//.style("fill", function(d) { return colours(d.r) })
			.style("cursor", "pointer")
			.on("mouseover", function(d) {		
				div.transition()		
				.duration(200)		
				.style("opacity", .9);		
				div.html("Concept: " + d.text + "<br/>Relevance: " + d.r + "%" + "<br/>DBpedia Resource: <a href='" + d.dbpedia_resource + "' target='_blank'>" + d.dbpedia_resource + "</a>")	
				.style("left", (d3.event.pageX) + "px")		
				.style("top", (d3.event.pageY - 150) + "px");
			})					
			.on("mouseout", function(d) {		
				div.transition()		
				.duration(500)		
				.delay(1000)
				.style("opacity", 0);	
			})
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));    


			var ticked = function() {
				node
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
			}  

			simulation
			.nodes(data.nodes)
			.on("tick", ticked);

			function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}

			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}

			function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			} 

			setColour();

		}

		function setColour() {
			minColour = vm.selectedOption.minCol;
			maxColour = vm.selectedOption.maxCol;

			var colours = d3.scaleLinear()
			.domain([minRelevance*bubbleScale,maxRelevance*bubbleScale])
			.range([minColour, maxColour]);

			svg.selectAll("circle").style("fill", function(d) { return colours(d.r) });
		}
	}

})();
