/**
* @author Ben Rogers <bjr342@uowmail.edu.au>
* @ngdoc controller
* @name visualisation.controller:donutChartCtrl
* @description Controller for the donut chart visualisation
*/
(function () {

	angular
	.module('visualisations')
	.controller('donutChartCtrl', donutChartCtrl);

	/* @ngInject */
	function donutChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;
		var responseData = [];

		analysisData = [];
		var sortData = [];

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'donut-chart'});	// Start animated loading overlay
			analysisService.readWatsonAnalysis(analysisId) //gets id from url
			.then(function(data) {	
			switch (analysisType) {
				case 'concepts':
					data.concepts.forEach(function(concept){
						var relevance = concept.relevance*100;
						var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);  // Capitalise first letter 
						responseData.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
					});
					sortRelevance(); 
					checkLength();
				break;
				case 'keywords':
					data.keywords.forEach(function(keyword){
						var relevance = keyword.relevance*100;
						var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);  // Capitalise first letter
						responseData.push({relevance: keyword.relevance, text: text});
					});

					sortRelevance();
					checkLength();
				break;
      		}
      		
				
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'donut-chart'});	// If error, stop animated loading overlay
			}); 
		}

	    /**
	    * @ngdoc function
	    * @name checkLength
	    * @methodOf visualisation.controller:donutChartCtrl
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
	    * @methodOf visualisation.controller:donutChartCtrl
	    * @description Function sorts the analysis data in ascending order on relevance. Function is used
	    * when drawing keyword and concept analysis
	    * @returns {array} The sorted array
	    */    
	    function sortRelevance() {
	      responseData.sort(function (a, b) {
	        return a.relevance - b.relevance;
	      });
	    }

	    function roundUp() {

	    }

		function drawChart(data) {

		var tooltip = d3.select('#chart')            
		  .append('div')                             
		  .attr('class', 'tooltip');                 

		tooltip.append('div')                        
		  .attr('class', 'label');                   

		tooltip.append('div')                        
		  .attr('class', 'count');                   

		tooltip.append('div')                        
		  .attr('class', 'percent');                 


  		var width = 720;
        var height = 720;
        var radius = Math.min(width, height) / 2;

        var color = d3.scaleOrdinal(d3.schemeCategory20c);

        var svg = d3.select('#chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');

          var donutWidth = 150;

		var arc = d3.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.pie()
          .value(function(d) { return d.relevance; })
          .sort(null);	


        var legendRectSize = 25;
        var legendSpacing = 8;
        
        var path = svg.selectAll('path')
          .data(pie(data))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.text);
          });

          var div = d3.select("path").append("div").attr("class", "tooltip");

		path.on('mouseover', function(d) {
		 tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "block")
                .html((d.text) + "<br>" + (d.relevance) + "%");
        tooltip.select('.label').html(d.data.text);
        tooltip.select('.count').html(d.data.relevance);
		});
        
		path.on('mouseout', function() {
		  tooltip.style('display', 'none');
		});

		var legend = svg.selectAll('.legend')
		  .data(color.domain())
		  .enter()
		  .append('g')
		  .attr('class', 'legend')
		  .attr('transform', function(d, i) {
		    var height = legendRectSize + legendSpacing;
		    var offset =  height * color.domain().length / 2;
		    var horz = -2 * legendRectSize;
		    var vert = i * height - offset;
		    return 'translate(' + horz + ',' + vert + ')';
		  });
		        
		legend.append('rect')
		  .attr('width', legendRectSize)
		  .attr('height', legendRectSize)
		  .style('fill', color)
		  .style('stroke', color);
		        
		legend.append('text')
		  .attr('x', legendRectSize + legendSpacing)
		  .attr('y', legendRectSize - legendSpacing)
		  .text(function(d) { return d; });

		}
	}

})();
