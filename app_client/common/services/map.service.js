(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('mapService', mapService);

	mapService.$inject = ['logger'];
	function mapService (logger) {
		return {
			getPosition	: getPosition
		};

        ///////////////////////////

        function getPosition(cbSuccess) {
        	if (navigator.geolocation) {
        		navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        	}
        	else {
        		cbNoGeo();
        	}

        	function cbError(error) {
        		console.log(error);
        		if(error.code == 1)
        			logger.warning(error.message, error, 'Warning');
        		else
        			logger.error(error.message, error, 'Error');
        	}

        	function cbNoGeo() {
        		logger.error('Geolocation is not supported by this browser', 'Error', 'Error');
        	}
        };
    }

})();

