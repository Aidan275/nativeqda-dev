/**
* @author Ben Rogers <bjr342@uowmail.edu.au>
* @ngdoc controller
* @name visualisations.controller:barChartCtrl
* @description Controller for the bar chart visualisation
*/
(function () {

  angular
  .module('visualisations')
  .controller('barChartCtrl', barChartCtrl);


  /* @ngInject */
  function barChartCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
    var vm = this;

    var analysisType = $routeParams.type; 
    var analysisId = $routeParams.id;

    var responseData = [];
    var sortData = [];
    vm.cols = [];
    activate();
    

    //Bindable functions
    vm.top10 = top10;
    vm.bottom10 = bottom10;
    vm.redraw = redraw;


    /**
    * @ngdoc function
    * @name activate
    * @methodOf visualisations.controller:barChartCtrl
    * @description Gets data to draw the bar chart for either concepts, entities or keywords
    */
    function activate() {
      bsLoadingOverlayService.start({referenceId: 'bar-chart'});  // Start animated loading overlay
      analysisService.readWatsonAnalysis(analysisId) //gets id from url
      .then(function(data) {
        var analysisData = data; //store watson response in analysisData

        switch (analysisType) {
          case 'concepts':
            analysisData.concepts.forEach(function(concept){
              var relevance = concept.relevance*100;
              var text = concept.text.charAt(0).toUpperCase() + concept.text.slice(1);  // Capitalise first letter 
            responseData.push({relevance: concept.relevance, text: text, dbpedia_resource: concept.dbpedia_resource});
            });
            sortRelevance(); 
            checkLength();
          break;
          case 'entities':
            analysisData.entities.forEach(function(entity){
              var count = entity.count;
              var text = entity.text;
            responseData.push({count: entity.count, text: text});
            });
            sortCount();
            responseData.reverse();
            drawEntityChart(responseData);
          break;
          case 'keywords':
            analysisData.keywords.forEach(function(keyword){
              var relevance = keyword.relevance*100;
              var text = keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1);  // Capitalise first letter
            responseData.push({relevance: keyword.relevance, text: text});
            });
            sortRelevance();
            checkLength();
          break;
        }



      }, function(err) {
        bsLoadingOverlayService.stop({referenceId: 'bar-chart'}); // If error, stop animated loading overlay
      }); 
    }

    /**
    * @ngdoc function
    * @name checkLength
    * @methodOf visualisations.controller:barChartCtrl
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
    * @methodOf visualisations.controller:barChartCtrl
    * @description Function sorts the analysis data in ascending order on relevance. Function is used
    * when drawing keyword and concept analysis
    * @returns {array} The sorted array
    */    
    function sortRelevance() {
      responseData.sort(function (a, b) {
        return a.relevance - b.relevance;
      });
    }

    /**
    * @ngdoc function
    * @name sortCount
    * @methodOf visualisations.controller:barChartCtrl
    * @description Function sorts the analysis data in ascending order on count. Function is used
    * when drawing entity analysis
    * @returns {array} The sorted array
    */ 
    function sortCount() {
      responseData.sort(function (a, b) {
        return a.count - b.count;
      }); 
    }

    function top10() {
      //Visualisation is already showing the top 10 in descending order
      //Call this 
      sortRelevance(); //Sort them in ascending order
      sortData = responseData.slice(0, 10); //Grab first 10 elements
      redraw(sortData);
    }

    function bottom10() {
      sortRelevance();
      sortData = responseData.slice(0, 10);
      redraw(sortData);
    }

  function redraw(data) {
    //Remove the old graph
    //console.log(data);
    d3.selectAll("svg").remove();
    drawChart(data);
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

    /**
    * @ngdoc function
    * @name drawChart
    * @methodOf visualisations.controller:barChartCtrl
    * @description Function takes the trimmed and sorted data and using d3 draws a bar chart on relevance
    * function is called when drawing keyword and concept analysis
    * @param {object} data An object consisting of
    *
    * relevance: A score of how relevant the keyword or concept is  
    * text: The name of the element  
    * dbpedia_resource: A link to dbpedias page on the resource
    */
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


    /**
    * @ngdoc function
    * @name drawEntityChart
    * @methodOf visualisations.controller:barChartCtrl
    * @description Function takes the trimmed and sorted data and using d3 draws a bar chart on relevance
    * function is called when drawing keyword and concept analysis
    * @param {object} data An object consisting of
    *
    * count: A score of how many times the entity was mentioned  
    * text: The name of the element
    */

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



})();