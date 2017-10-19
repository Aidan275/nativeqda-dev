/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview 
* @name configure
* @description This page handles the global configuration of the system.
*/

(function() {

	'use strict';

	angular
	.module('nativeQDA')
	.config(configure);

	/* @ngInject */
	function configure($qProvider, $logProvider) {

		/* Disables console errors for unhandled rejections since */
		/* these are being caught in the services and processed by */
		/* the exception service */
		$qProvider.errorOnUnhandledRejections(true);

		/* toastr config */
		toastr.options.closeButton = true;
		toastr.options.timeOut = 3000;
		toastr.options.positionClass = 'toast-top-right';

		/* Turn debugging off/on (no info or warn) */
		if ($logProvider.debugEnabled) {
			$logProvider.debugEnabled(true);
		}   
	}

})();