/**
* @author Ben Rogers
* @email bjr342@uowmail.edu.au
* @ngdoc controller
* @name visualisations.controller:networkChartCtrl
* @description Controller for the network chart visualisation
*/

(function () {

	angular
	.module('visualisations')
	.controller('networkChartCtrl', networkChartCtrl);

	/* @ngInject */
	function networkChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;
		var responseData = [];

		analysisData = [];
		var sortData = [];

		var common = ["he", "she", "the", "of", "and", "a", "to", "in", "is", "you", 
						"that", "it", "was", "for", "on", "are", "as", "with", "his",
						"they", "I", "at", "be", "this", "have", "from", "or", "one",
						"had", "by", "word", "but", "not", "what", "all", "where", "your",
						"can", "said", "there", "use", "an", "each", "which", "do", "how", "their", 
						"if", "will", "Mr", "Ms"];


		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'network-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisId) //gets id from url
			.then(function(data) {	
			
				var repeaterID = 0;
				data.relations.forEach(function(object) {
					object.arguments = object.arguments || {};	// If no object child, set object to empty (to prevent undefined error)
					object.score = object.score || {};

					var anObject = 	{
						id: repeaterID,
						argumentA: object.arguments[0].text,
						argumentB: object.arguments[1].text,
						score: object.score
					};
					responseData.push(anObject);
					repeaterID++;
				});	

				tidyData(responseData);
				drawChart();
				
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'network-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function tidyData(data) {
			var tidy = [];

			//Remove common words
			console.log(data);

			//for each
			data.forEach(function(obj){
				var arrayLength = common.length;
				for(var i = 0; i < arrayLength; i++) {
					if(common[i] === obj.argumentA) {
						console.log("common");
						//remove

					}else {

					}
				}
					
			});

			//Remove duplicates
			//Tidy data
			console.log(tidy);

			var i = 0;

			data.forEach(function (data) {
				tidy.push({name: "", group: i});
				i++;
			});



			var group = 0;
				
				


		}


		function drawChart() {

			var json = {
			  "nodes":[
			    {"name":"node1","group":1},
			    {"name":"node2","group":2},
			    {"name":"node3","group":2},
			    {"name":"node4","group":3}
			  ],
			  "links":[
			    {"source":2,"target":1,"weight":1},
			    {"source":0,"target":2,"weight":3}
			  ]
			};

			var width = 960,
			    height = 500

			var svg = d3.select("body").append("svg")
			    .attr("width", width)
			    .attr("height", height);

			var force = d3.layout.force()
			    .gravity(.05)
			    .distance(100)
			    .charge(-100)
			    .size([width, height]);



			  force
			      .nodes(json.nodes)
			      .links(json.links)
			      .start();

			  var link = svg.selectAll(".link")
			      .data(json.links)
			    .enter().append("line")
			      .attr("class", "link")
			    .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

			  var node = svg.selectAll(".node")
			      .data(json.nodes)
			    .enter().append("g")
			      .attr("class", "node")
			      .call(force.drag);

			  node.append("circle")
			      .attr("r","5");

			  node.append("text")
			      .attr("dx", 12)
			      .attr("dy", ".35em")
			      .text(function(d) { return d.name });

			  force.on("tick", function() {
			    link.attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

			    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			  });

		}

}


		
	
})();
