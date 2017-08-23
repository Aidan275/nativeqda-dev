(function () { 

	angular
	.module('nativeQDAApp')
	.controller('knowledgebaseCtrl', knowledgebaseCtrl);
	
	function knowledgebaseCtrl ($routeParams,analysisService, bsLoadingOverlayService) {
	
		var vm = this;

		// Scrolls to the top of the page
		document.body.scrollTop = 0; // For Chrome, Safari and Opera 
	    document.documentElement.scrollTop = 0; // For IE and Firefox

	    var slideout = new Slideout({
	    	'panel': document.querySelector('#panel'),
	    	'menu': document.querySelector('#menu'),
	    	'padding': 256,
	    	'tolerance': 70
	    });

	    vm.toggleOptions = toggleOptions;
	    vm.updateFontScale = updateFontScale;
	    vm.setCicleColour = setCicleColour;
	    vm.updateToLinearScale = updateToLinearScale;
	    vm.updateToPowScale = updateToPowScale;

	    vm.textColour = '#000000';
	    vm.bubbleColour1 = '#e4e4d9';
	    vm.bubbleColour2 = '#4676fa';
	    vm.bgColour = '#ffffff';
	    vm.fontScale = {
	    	value: 14
	    };
	    vm.powScale = {
	    	value: 2
	    };
	    vm.selectedScale = 'linear';

	    vm.textColourChange;

	    var analysisType = $routeParams.type;
	    var id = $routeParams.id;

	    var dataNodes = [];
	    var data;

	    var width = document.querySelector("#graph").clientWidth;
	    var height = document.querySelector("#graph").clientHeight;
	    var maxRelevance = 0;
	    var minRelevance = 100;

	    function toggleOptions() {
	    	slideout.toggle();
	    }

	   
	   
		///////////////////////////

		

		

		function setCicleColour() {
			var colours = d3.scaleLinear()
			.domain([minRelevance, maxRelevance])
			.range([vm.bubbleColour1, vm.bubbleColour2]);

			svg.selectAll("circle").style("fill", function(d) { return colours(d.relevance) });

			var linear = d3.scaleLinear()
			.domain([minRelevance*100, maxRelevance*100])
			.range([vm.bubbleColour1, vm.bubbleColour2]);

			var legendLinear = d3.legendColor()
			.shapeWidth(30)
			.cells(10)
			.orient('horizontal')
			.scale(linear)
			.title("Relevance (%)");

			legendSvg.select(".svg-legend-class")
			.call(legendLinear);
		}

		vm.bgColourOptions = { format:'hexString', case:'lower' };
		vm.textColourOptions = { format:'hexString', case:'lower' };
		vm.bubbleColourOptions1 = { format:'hexString', case:'lower' };
		vm.bubbleColourOptions2 = { format:'hexString', case:'lower' };

		vm.bgColourChange = { onChange: function(api, color) { document.querySelector(".graph-svg-component").style.background = color; } };
		vm.textColourChange = {	onChange: function(api, color, $event) { svg.selectAll("text").style("fill", color); } };
		vm.bubbleColourChange1 = { onChange: function() { setCicleColour(); } };
		vm.bubbleColourChange2 = { onChange: function() { setCicleColour(); } };

		function updateFontScale() { 
			svg.selectAll("text").style("font-size", function(d) { 
				return d.radius*vm.fontScale.value/50; 
			})
		}

		function updateToLinearScale() { 
			if(vm.selectedScale === 'linear') {
				var linearScale = d3.scaleLinear()
				.domain([0, 1])
				.range([0, 100]);

				var colours = d3.scaleLinear()
				.domain([minRelevance, maxRelevance])
				.range([vm.bubbleColour1, vm.bubbleColour2]);

				svg.selectAll("circle").style("fill", function(d) { return colours(d.relevance); });

				node
				.each(function(d) {
					d.radius = linearScale(d.relevance);
				})
				.transition()
				.duration(500)
				.attr("r", function(d) { return d.radius; });
				forceCollide.radius(function(d) { return d.radius; });

				updateFontScale()

				var linear = d3.scaleLinear()
				.domain([minRelevance*100, maxRelevance*100])
				.range([vm.bubbleColour1, vm.bubbleColour2]);

				var legendLinear = d3.legendColor()
				.shapeWidth(30)
				.cells(10)
				.orient('horizontal')
				.scale(linear)
				.title("Relevance (%)");

				legendSvg.select(".svg-legend-class")
				.call(legendLinear);

				simulation.alphaTarget(0.3).restart();
			}
		}

		function updateToPowScale() { 
			vm.selectedScale = 'power';
			if(vm.powScale.value) {
				var powerScale = d3.scalePow().exponent(vm.powScale.value)
				.domain([0, 1])
				.range([0, 100]);

				var colours = d3.scalePow().exponent(vm.powScale.value)
				.domain([minRelevance, maxRelevance])
				.range([vm.bubbleColour1, vm.bubbleColour2]);

				svg.selectAll("circle").style("fill", function(d) { return colours(d.relevance); });

				node
				.each(function(d) {
					d.radius = powerScale(d.relevance);
				})
				.transition()
				.duration(500)
				.attr("r", function(d) { return d.radius; });

				forceCollide.radius(function(d) { return d.radius; });

				updateFontScale()

				var legPower = d3.scalePow().exponent(vm.powScale.value)
				.domain([minRelevance*100, maxRelevance*100])
				.range([vm.bubbleColour1, vm.bubbleColour2]);

				var legendPower = d3.legendColor()
				.shapeWidth(30)
				.cells(10)
				.orient('horizontal')
				.scale(legPower)
				.title("Relevance (%)");

				legendSvg.select(".svg-legend-class")
				.call(legendPower);

				simulation.alphaTarget(0.3).restart();
			}
		}

	}

})();
