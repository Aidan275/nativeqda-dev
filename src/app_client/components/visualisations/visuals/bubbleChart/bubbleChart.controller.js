(function () {

	angular
	.module('nativeQDAApp')
	.controller('bubbleChartCtrl', bubbleChartCtrl);

	/* @ngInject */
	function bubbleChartCtrl ($routeParams, analysisService) {
		var vm = this;

		var id = $routeParams.id;
		vm.analysisData = {};
		var dataNodes = [];

		var width,height
		var chartWidth, chartHeight
		var margin
		var svg = d3.select("#graph").append("svg")
		var chartLayer = svg.append("g").classed("chartLayer", true)

		analysisService.readConceptAnalysis(id)
		.then(function(response) {
			vm.analysisData = response.data;
			setupData();
		});

		function setupData() {
			vm.analysisData.concepts.forEach(function(concept){
				dataNodes.push({text: concept.text, r: concept.relevance*100, dbpedia_resource: concept.dbpedia_resource});
			});

			main();
		}

		function main() {
			var range = 10
			// var data = {nodes:d3.range(0, range).map(function(d){ return {label: "l"+d ,r:~~d3.randomUniform(40, 80)()}})};
			var data = {nodes: dataNodes};

			setSize(data)
			drawChart(data)    
		}

		function setSize(data) {
			width = document.querySelector("#graph").clientWidth
			height = document.querySelector("#graph").clientHeight

			margin = {top:0, left:0, bottom:0, right:0 }


			chartWidth = width - (margin.left+margin.right)
			chartHeight = height - (margin.top+margin.bottom)

			svg.attr("width", width).attr("height", height)


			chartLayer
			.attr("width", chartWidth)
			.attr("height", chartHeight)
			.attr("transform", "translate("+[margin.left, margin.top]+")")
		}

		function drawChart(data) {

			var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.index }))
			.force("collide",d3.forceCollide( function(d){return d.r + 1 }).iterations(24) )
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(chartWidth / 2, chartWidth / 2))
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
			.on("mouseover", function(d) {		
				div.transition()		
				.duration(200)		
				.style("opacity", .9);		
				div.html("Concept: " + d.text + "<br/>Relevance: " + d.r + "%" + "<br/>DBpedia Resource: <a href='" + d.dbpedia_resource + "' target='_blank'>" + d.dbpedia_resource + "</a>")	
				.style("left", (d3.event.pageX) + "px")		
				.style("top", (d3.event.pageY - 28) + "px");	
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

		}
	}

})();
