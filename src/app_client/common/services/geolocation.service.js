(function () { 

	angular
	.module('common.services')
	.service('geolocService', geolocService);

	function geolocService () {
		return {
			getPosition: getPosition
		};

		///////////////////////////

		function getPosition(cbSuccess, cbError, cbNoGeo) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
			}
			else {
				cbNoGeo();
			}
		};

	}

})();