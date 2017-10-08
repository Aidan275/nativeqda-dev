/**
* @author Ben Rogers
* @email bjr342@uowmail.edu.au
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
    var isMobile = false;
    var sortData = [];
    vm.cols = [];
    activate();
    

    //Bindable functions
    vm.top10 = top10;
    vm.bottom10 = bottom10;
    vm.redraw = redraw;
    vm.checkMobile = checkMobile;

    var slideout = new Slideout({
      'panel': document.querySelector('#barPanel'),
      'menu': document.querySelector('#barMenu'),
      'padding': 256,
      'tolerance': 70
    });

    vm.toggleOptions = toggleOptions;

    function checkMobile() {
      isMobile = false; //initiate as false
    // device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

      console.log(isMobile);
    }

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

    function toggleOptions() {
      slideout.toggle();
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

      isMobile = false; //initiate as false
    // device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

    console.log(isMobile);


    if(isMobile) {

      //Set the drawing space for the graph
      var svg = d3.select("svg"),
        margin = {top: 50, right: 50, bottom: 500, left: 120},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom+30;

    }else {

      //Set the drawing space for the graph
      var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 200, left: 40},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom+30;
    }

    
        
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


    function resize() {
      /* Find the new window dimensions */
      var width = parseInt(d3.select("#graph").style("width")) - margin*2,
      height = parseInt(d3.select("#graph").style("height")) - margin*2;

      /* Update the range of the scale with new width/height */
      xScale.range([0, width]).nice(d3.time.year);
      yScale.range([height, 0]).nice();

      /* Update the axis with the new scale */
      graph.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      graph.select('.y.axis')
        .call(yAxis);

      /* Force D3 to recalculate and update the line */
      graph.selectAll('.line')
        .attr("d", line);
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