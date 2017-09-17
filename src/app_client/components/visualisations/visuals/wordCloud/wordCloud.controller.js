(function () {

	angular
	.module('visualisations')
	.controller('wordCloudCtrl', wordCloudCtrl);

	/* @ngInject */
	function wordCloudCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;

		var data = [];

		var width = document.querySelector(".svg-container").clientWidth;
		var height = document.querySelector(".svg-container").clientHeight;
		var maxSize = 0;
		var minSize = 100;

		activate();
		
		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'word-cloud'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisId) //gets id from url
			.then(function(data) {

				switch (analysisType) {
					case 'categories':
					categoriesCloud(data);
					break;
					case 'concepts':
					conceptCloud(data);
					break;
					case 'entities':
					entitiesCloud(data);
					break;
					case 'keywords':
					keywordCloud(data);
					break;
					case 'relations':
					//relationsTable();
					break;
					case 'semantic-roles':
					//semanticRolesTable();
					break;
				}

			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'word-cloud'});	// If error, stop animated loading overlay
			}); 
		}

		function categoriesCloud(analysisData) {
			analysisData.categories.forEach(function(category){
				console.log(category);
				var score = category.score*100;
				var text = category.label.toLowerCase(); 

				maxSize = (score > maxSize ? score : maxSize);
				minSize = (score < minSize ? score : minSize);

				data.push({text: text, size: score});
			});

			drawWordCloud();
		}

		function conceptCloud(analysisData) {
			analysisData.concepts.forEach(function(concept){
				var relevance = concept.relevance*50;
				var text = concept.text.toLowerCase(); 

				maxSize = (relevance > maxSize ? relevance : maxSize);
				minSize = (relevance < minSize ? relevance : minSize);

				data.push({text: text, size: relevance});
			});

			drawWordCloud();
		}

		function entitiesCloud(analysisData) {
			analysisData.entities.forEach(function(entity){
				var count = entity.count*50;
				var text = entity.text.toLowerCase(); 

				maxSize = (count > maxSize ? count : maxSize);
				minSize = (count < minSize ? count : minSize);

				data.push({text: text, size: count});
			});

			drawWordCloud();
		}
		

		function keywordCloud(analysisData) {
			analysisData.keywords.forEach(function(keyword){
				var relevance = keyword.relevance*50;
				var text = keyword.text.toLowerCase(); 

				maxSize = (relevance > maxSize ? relevance : maxSize);
				minSize = (relevance < minSize ? relevance : minSize);

				data.push({text: text, size: relevance});
			});

			drawWordCloud();
		}

		function drawWordCloud() {
			var fill = d3.scaleOrdinal(d3.schemeCategory20);

			var colours = d3.scaleLinear()
			.domain([minSize, maxSize])
			.range(['#666', '#4676fa']);

			var layout = d3.layout.cloud()
			.timeInterval(10)
			.size([width, height])
			.words(data)
			.rotate(function() { return Math.floor(Math.random() * 20) + -10; }) /* Sets the rotation of the word between -10 and 10 degrees */
			.font("Impact")
			.fontSize(function(d) { return d.size; })
			.on("end", draw)
			.start();

			function draw(words) {
				var count = 0;

				var svg = d3.select("div.svg-container")
				.append("svg")
				.attr("width", width)
				.attr("height", height);

				var g = svg.append("g");

				g.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) { return d.size + "px"; })
				.style("font-family", "Impact")
				.style("fill", function(d, i) { return colours(d.size); })
				.attr("text-anchor", "middle")
				.attr("transform", function(d) { return "translate(" + [d.x + (width/2), d.y + (height/2)] + ")rotate(" + d.rotate + ")"; })
				.text(function(d) { return d.text; });

				svg.append("rect")
				.attr("width", width)
				.attr("height", height)
				.style("fill", "none")
				.style("pointer-events", "all")
				.call(d3.zoom().on("zoom", zoomed));

				function zoomed() {
					g.attr("transform", d3.event.transform);
				}

			}
		}
	}

})();
