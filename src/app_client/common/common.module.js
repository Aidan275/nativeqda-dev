/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name common
* @requires nativeQDA
* @description 
* # Description
* The {@link common common} module is a sub-module of the {@link nativeQDA nativeQDA} module, the core module of this application.
* 
* This module consists of the following sub-modules
*
* - {@link directives directives}
* - {@link factories factories}
* - {@link filters filters}
* - {@link services services}
*/

(function() {

	'use strict';

	angular.module('common', [

		'directives',
		'factories',
		'filters',
		'services'
		
		]);
})();
