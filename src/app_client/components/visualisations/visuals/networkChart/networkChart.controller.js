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


	function networkChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		console.log();

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;
		var analysisName;
		var responseData = [];

		analysisData = [];
		var sortData = [];
		var tidy = [];

		var common = ["he", "she", "the", "of", "and", "a", "to", "in", "is", "you", 
						"that", "it", "was", "for", "on", "are", "as", "with", "his",
						"they", "I", "at", "be", "this", "have", "from", "or", "one",
						"had", "by", "word", "but", "not", "what", "all", "where", "your",
						"can", "said", "there", "use", "an", "each", "which", "do", "how", "their", 
						"if", "will", "Mr", "Ms", "one", "two", "man", "boy", "her", "Mr", "Mr.",
						"Mrs", "Mrs.", "me", "him", "He", "Her", "Their"];


		activate();

		var slideout = new Slideout({
      		'panel': document.querySelector('#netPanel'),
      		'menu': document.querySelector('#netMenu'),
      		'padding': 256,
      		'tolerance': 70
    	});

    	vm.toggleOptions = toggleOptions;

		///////////////////////////


		/* @ngInject */
		/**
	    * @ngdoc function
	    * @name activate
	    * @methodOf visualisations.controller:networkChartCtrl
	    * @description Gets data to draw the network chart for relations
	    */
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'network-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisId) //gets id from url
			.then(function(data) {	
				analysisName = data.name;
				var repeaterID = 0;
				data.relations.forEach(function(object) {
					object.arguments = object.arguments || {};	// If no object child, set object to empty (to prevent undefined error)
					object.score = object.score || {};

					var anObject = 	{
						id: repeaterID,
						argumentA: object.arguments[0].text,
						argumentB: object.arguments[1].text,
						score: object.score,
						common: false
					};
					responseData.push(anObject);
					repeaterID++;
				});	

				commonWords(responseData);
				
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'network-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function toggleOptions() {
      		slideout.toggle();
    	}


		/**
	    * @ngdoc function
	    * @name commonWords
	    * @methodOf visualisations.controller:networkChartCtrl
	    * @description Iterates through data and marks any member that is found in the common array.
	    * Function then adds members without common words to the tidy array
	    * @param {object} data An object consisting of
    	*
    	* id: An identifier for each member  
    	* argumentA: The first part involved in the relation  
    	* argumentB: The second part involved in the relation
	    * score: A score of how correct the WATSON analysis thinks the score is
	    * common: A boolean value indicating wether argumentA or argumentB contains a common word
	    */
		function commonWords(data) {
			console.log(data);
			
			//Mark objects with common words by increasing the common number
			data.forEach(function(obj){
				var arrayLength = common.length;

				//Search common words array with argumentA
				for(var i = 0; i < arrayLength; i++) {
					if(common[i] === obj.argumentA) {
						//If match dont use
						obj.common = true;
					}

					if(common[i] === obj.argumentB) {
						obj.common = true;
					}
				}		
			});

			var i = 0;

			//Set up root node
			tidy.push({name: analysisName, group: i, weight: 1});
			i++;

			data.forEach(function (data) {
				//If no common words used
				if(!data.common) {
					tidy.push({name: data.argumentA, group: i, weight: data.score});
					tidy.push({name: data.argumentB, group: i, weight: data.score});
					i++;
				}
				
			});

			makeLinks(data)
		}


		/**
	    * @ngdoc function
	    * @name makeLinks
	    * @methodOf visualisations.controller:networkChartCtrl
	    * @description Iterates through tidy data array creating links from each element
	    * to the root node and then links between each related group. The function then
	    * calls the drawChart function with the newly created links array
	    * @param {object} data An object consisting of
    	*
    	* id: An identifier for each member  
    	* argumentA: The first part involved in the relation  
    	* argumentB: The second part involved in the relation
	    * score: A score of how correct the WATSON analysis thinks the score is
	    * common: A boolean value indicating wether argumentA or argumentB contains a common word
	    */
		function makeLinks(data) {

			//Make links
			var links = [];			
			
			tidy.forEach(function (data) {
				//Make links to root node
				links.push({source: 0, target: data.group});
			});			 

			tidy.forEach(function (data, index) {
				if(index < tidy.length-1) {
					links.push({source: data.group, target: tidy[index+1].group});
				}else {
					links.push({source: data.group, target: data.group});
				}	
			});
 
			drawChart(tidy, links);
		}

		/**
	    * @ngdoc function
	    * @name drawChart
	    * @methodOf visualisations.controller:networkChartCtrl
	    * @description Using the formatted data created by commonWords and makeLinks
	    * this function draws a network chart using D3
	    * Code for drawing chart was taken from: https://bl.ocks.org/EfratVil/58b872b4f15a358c3a9822f5a285c5be
	    * @param {object} tidy An array of objects consisting of
	    * name: Name of the object involved in the relation
	    * group: Which group the element is in, the group determines
	    * what level in the graph it will be on. 0 is the root node
	    * weight: Score given by WATSON analysis on how relevant the relation is
	    * index: Keeps count of each element
	    * x: The x co-ordinates of where the element will appear on screen
	    * y: The y co-ordinates of where the element is on the screen
	    * @param {object} links An array of objects consisting of
	    * source: An integer referring to the group number for the connection source
	    * target: An integer referring to the group number for the connection destination
	    * index: An identifier for each link
	    */
		function drawChart(tidy, links) {
			console.log(tidy);
			console.log(links);
			var svg = d3.select("svg"),
			    width = +svg.attr("width"),
			    height = +svg.attr("height");

			var simulation = d3.forceSimulation()
			    .force("link", d3.forceLink())
			    .force("charge", d3.forceManyBody().strength(-850))
			    .force("center", d3.forceCenter(width / 2, height / 2));
			  
			links.forEach(function(d){
			    d.source = d.source;    
			    d.target = d.target;
			});

			var link = svg.append("g")
			                .style("stroke", "#aaa")
			                .selectAll("line")
			                .data(links)
			                .enter().append("line");

			var node = svg.append("g")
            			.attr("class", "nodes")
  			.selectAll("circle")
            			.data(tidy)
  			.enter().append("circle")
          			.attr("r", 6)
          			.call(d3.drag()
              			.on("start", dragstarted)
              			.on("drag", dragged)
              			.on("end", dragended));


            var label = svg.append("g")
      			.attr("class", "labels")
      			.selectAll("text")
      			.data(tidy)
      			.enter().append("text")
        			.attr("class", "label")
        			.text(function(d) { return d.name; })

        	simulation
      			.nodes(tidy)
      			.on("tick", ticked);

      		simulation.force("link")
      			.links(links);

      	  	function ticked() {
    			link
        			.attr("x1", function(d) { return d.source.x; })
        			.attr("y1", function(d) { return d.source.y; })
        			.attr("x2", function(d) { return d.target.x; })
        			.attr("y2", function(d) { return d.target.y; });

    			node
         			.attr("r", 20)
         			.style("fill", "#d9d9d9")
         			.style("stroke", "#969696")
         			.style("stroke-width", "1px")
         			.attr("cx", function (d) { return d.x+6; })
         			.attr("cy", function(d) { return d.y-6; });
    
   				label
    				.attr("x", function(d) { return d.x; })
            		.attr("y", function (d) { return d.y; })
            		.style("font-size", "14px").style("fill", "#4393c3");
  			}


			function dragstarted(d) {
  				if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  				//simulation.fix(d);
			}

			function dragged(d) {
			  //simulation.fix(d, d3.event.x, d3.event.y);
			}

			function dragended(d) {
			  if (!d3.event.active) simulation.alphaTarget(0);
			  //simulation.unfix(d);
			}
	           			
		}

}


		
	
})();
