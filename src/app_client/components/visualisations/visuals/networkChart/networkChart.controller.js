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

		console.log();

		var analysisType = $routeParams.type; 
		var analysisId = $routeParams.id;
		var analysisName;
		var responseData = [];

		analysisData = [];
		var sortData = [];

		var common = ["he", "she", "the", "of", "and", "a", "to", "in", "is", "you", 
						"that", "it", "was", "for", "on", "are", "as", "with", "his",
						"they", "I", "at", "be", "this", "have", "from", "or", "one",
						"had", "by", "word", "but", "not", "what", "all", "where", "your",
						"can", "said", "there", "use", "an", "each", "which", "do", "how", "their", 
						"if", "will", "Mr", "Ms", "one", "two", "man", "boy"];


		activate();

		///////////////////////////

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
						common: 0
					};
					responseData.push(anObject);
					repeaterID++;
				});	

				tidyData(responseData);

				
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'network-chart'});	// If error, stop animated loading overlay
			}); 
		}

		function tidyData(data) {
			var tidy = [];

			//Remove common words

			//for each
			data.forEach(function(obj){
				var arrayLength = common.length;

				//Search common words array with argumentA
				for(var i = 0; i < arrayLength; i++) {
					if(common[i] === obj.argumentA) {
						//If match dont use
						obj.common++;
					}

					if(common[i] === obj.argumentB) {
						obj.common++;
					}
				}		
			});

		
			//Tidy data
			console.log(analysisName);

			var i = 0;

			//Set up root node
			tidy.push({name: analysisName, group: i, weight: 1});
			i++;

			data.forEach(function (data) {
				//If no common words used
				if(data.common == 0) {
						var tidyLength = tidy.length;
						for(var i = 0; i < tidyLength; i++) {
							if(tidy[i].name == data.argumentA) {
								//Duplicate
								data.common = -1;
							}							
						}
						if(data.common == 0) {
							tidy.push({name: data.argumentA, group: i, weight: data.score});
							tidy.push({name: data.argumentB, group: i, weight: data.score});
							i++;
						}
					}				
			});

			//Remove duplicates
			console.log(data);

			//Make links
			var links = [];

			tidy.forEach(function (data) {
				//Make links to root node
				links.push({source: 0, target: data.group, weight: (data.weight*10)});
			});

			tidy.forEach(function (data) {
				links.push({source: data.group, target: data.group, weight: (data.weight*10)});
			});


			console.log(tidy);
			console.log(links);
 
			drawChart(tidy, links);
				
				


		}


		function drawChart(tidy, links) {


			console.log(tidy);
			console.log(links);
 

		}

}


		
	
})();
