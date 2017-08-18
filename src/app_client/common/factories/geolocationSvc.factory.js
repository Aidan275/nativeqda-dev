(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
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