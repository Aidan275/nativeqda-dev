/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name nativeQDA
* @description The {@link nativeQDA nativeQDA} module is the core module for the NativeQDA application.  
* 
* This module consists of the following sub-modules
*
* **Sub-Modules**
* - {@link common common}
* - {@link components components}
*
* The following 3rd party modules are also required for the NativeQDA application
*
* **3rd Party Modules**
* - {@link ngRoute ngRoute}
* - {@link ngSanitize ngSanitize}
* - {@link ngTable ngTable}
* - {@link ngAnimate ngAnimate}
* - {@link ui.bootstrap ui.bootstrap}
* - {@link ui.bootstrap.datepicker ui.bootstrap.datepicker}
* - {@link ngFileUpload ngFileUpload}
* - {@link ngTagsInput ngTagsInput}
* - {@link jp.ng-bs-animated-button jp.ng-bs-animated-button}
* - {@link bsLoadingOverlay bsLoadingOverlay}
* - {@link color.picker color.picker}
* - {@link angular-carousel angular-carousel}
*/

(function () {

	'use strict';

	angular.module('nativeQDA', [
		'ngRoute', 
		'ngSanitize', 
		'ngTable', 
		'ngAnimate', 
		'ui.bootstrap', 
		'ui.bootstrap.datepicker', 
		'ngFileUpload', 
		'ngTagsInput', 
		'jp.ng-bs-animated-button', 
		'bsLoadingOverlay', 
		'color.picker', 
		'angular-carousel',

		'common',
		'components'

		]);	

})();