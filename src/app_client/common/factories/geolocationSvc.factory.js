/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc object 
* @name factories.service:geolocationSvc
* @description Factory for geolocating the user to display their location on a map.
*/

(function () {

	'use strict';

	angular
	.module('factories')
	.factory('geolocationSvc', geolocationSvc);

	/* @ngInject */
	function geolocationSvc($q, $window) {
		return {
			getCurrentPosition: getCurrentPosition
		};

		function getCurrentPosition() {
			var deferred = $q.defer();

			if (!$window.navigator.geolocation) {
				deferred.reject('Geolocation not supported.');
			} else {
				$window.navigator.geolocation.getCurrentPosition(
					function (position) {
						deferred.resolve(position);
					},
					function (err) {
						deferred.reject(err);
					});
			}
			return deferred.promise;
		}
	}

})();