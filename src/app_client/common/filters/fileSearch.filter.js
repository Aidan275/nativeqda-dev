/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc filter 
* @name filters.filter:fileSearch
* @description Filter for searching for files on the map page
*/
(function () {

	angular
	.module('filters')
	.filter('fileSearch', fileSearch);


	function fileSearch($filter) {	/* Need to include $filter to get the formatted date */
		return function(data, search) {
			if(angular.isDefined(search)) {
				var results = [];
				var i;
				var searchVal = search.toLowerCase();
				for(i = 0; i < data.length; i++){
					var name = data[i].name.toLowerCase();
					var createdBy = data[i].createdBy.toLowerCase();
					var lastModified = $filter('date')(data[i].lastModified, "dd MMMM, yyyy").toLowerCase();	/* Formats the date to the same date as the date displayed on the map page */
					if(name.indexOf(searchVal) >=0 || createdBy.indexOf(searchVal) >=0 || lastModified.indexOf(searchVal) >=0){
						results.push(data[i]);
					}
				}
				return results;
			} else {
				return data;
			}
		};
	}

})();