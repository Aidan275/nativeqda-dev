/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name components
* @requires nativeQDA
* @description 
* # Description
* The {@link components components} module is a sub-module of the {@link nativeQDA nativeQDA} module, the core module of this application. 
* 
* This module consists of the following sub-modules
*
* **Sub-Modules**
* - {@link analysis analysis}
* - {@link auth auth}
* - {@link datasets datasets}
* - {@link files files}
* - {@link home home}
* - {@link map map}
* - {@link settings settings}
* - {@link survey survey}
* - {@link visualisations visualisations}
*/

(function() {

	'use strict';

	angular.module('components', [

		'analysis',
		'auth',
		'files',
		'home',
		'map',
		'settings',
		'survey',
		'visualisations'

		]);

})();
