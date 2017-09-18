(function () {

	angular
	.module('visualisations')
	.controller('wordCloudCtrl', wordCloudCtrl);

	/* @ngInject */
	function wordCloudCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;

		/* Scrolls to the top of the page */
		document.body.scrollTop = 0; /* For Chrome, Safari and Opera */
		document.documentElement.scrollTop = 0; /* For IE and Firefox */

		var slideout = new Slideout({
			'panel': document.querySelector('#wcPanel'),
			'menu': document.querySelector('#wcMenu'),
			'padding': 256,
			'tolerance': 70
		});

		vm.toggleOptions = toggleOptions;
		vm.updateChart = updateChart;

		vm.wordSpacingFactor = {
			value: 1
		};
		vm.wordColour1 = '#a5a5a5';
		vm.wordColour2 = '#4676fa';
		vm.wordColourOptions1 = { format:'hexString', case:'lower' };
		vm.wordColourOptions2 = { format:'hexString', case:'lower' };
		vm.wordColourChange1 = { onChange: function() { setWordColour(); } };
		vm.wordColourChange2 = { onChange: function() { setWordColour(); } };

		var svg;
		var data = [];

		var width = document.querySelector(".svg-container").clientWidth;
		var height = document.querySelector(".svg-container").clientHeight;

		var maxSize = 0;
		var minSize = 100;

		var translateX = width/2;
		var translateY = height/2;
		var scale = 1;

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
				var score = category.score*50;
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
			.range([vm.wordColour1, vm.wordColour2]);

			d3.layout.cloud().size([width, height])
			.words(data)
			.rotate(0)
			.fontSize(function(d) { return d.size; })
			.on("end", draw)
			.start();

			function draw(words) {
				var zoom = d3.zoom()
				.on("zoom", zoomed);

				svg = d3.select("div.svg-container")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "wordcloud")
				.call(zoom);

				var g = svg.append("g");
				
				g.attr("transform", "translate(" + translateX + ", " + translateY + ") scale(" + scale + ")")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) { return d.size + "px"; })
				.style("font-family", "Impact")
				.style("fill", function(d, i) { return colours(d.size); })
				.style("cursor", "default")
				.attr("transform", function(d) { return "translate(" + [d.x*vm.wordSpacingFactor.value, d.y*vm.wordSpacingFactor.value] + ")"; })
				.text(function(d) { return d.text; });

				svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));

				function zoomed(){
					translateX = d3.event.transform.x;
					translateY = d3.event.transform.y;
					scale = d3.event.transform.k;
					g.attr("transform", d3.event.transform);
				}

			}

			bsLoadingOverlayService.stop({referenceId: 'word-cloud'});	// Stop animated loading overlay
		}

		function toggleOptions() {
			slideout.toggle();
		}

		function updateChart() {
			d3.selectAll("div.svg-container > *").remove();
			drawWordCloud();
		}

		function setWordColour() {
			var colours = d3.scaleLinear()
			.domain([minSize, maxSize])
			.range([vm.wordColour1, vm.wordColour2]);

			svg.selectAll("text").style("fill", function(d) { return colours(d.size) });
		}
	}

})();
