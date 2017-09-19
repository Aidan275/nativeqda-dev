/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name common
* @description The common module is a sub-module of the nativeQDA module, the main module of this application.
* 
* The sub-modules of the common module include:
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
