/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name datasets
* @requires components
* @deprecated Was added as we anticipated that analyses would have settings that could be configured per analysis, 
* so instead of needing to select multiple files each time the settings of an analysis were changed, we added the 
* concept of datasets which consisted of a selected number of files. 
* This has not happened yet so datasets only add an unnecessary step to the analysis process. 
* @description 
* # Description
* Used to combine any number of compatible files together into one 'dataset' that could then be analysed. 
* Datasets can be created, modified, viewed, and deleted.
*
* This module consists of the following controllers
*
* **Controllers**
* - {@link datasets.controller:datasetsCtrl datasetsCtrl}
* - {@link datasets.controller:newDatasetCtrl newDatasetCtrl}
* - {@link datasets.controller:viewDatasetCtrl viewDatasetCtrl}
* - {@link datasets.controller:editDatasetCtrl editDatasetCtrl}
*/

(function() {

	'use strict';

	angular.module('datasets', []);

})();
