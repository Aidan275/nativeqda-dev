(function () {

	// Google async initializer needs global function, so we use $window
	angular
	.module('nativeQDAApp')
	.service('GoogleMapsInitialiser', GoogleMapsInitialiser);

	GoogleMapsInitialiser.$inject = ['$window', '$q'];
	function GoogleMapsInitialiser ($window, $q) {
		//Google's url for async maps initialization accepting callback function
		var asyncUrl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCEMpLtx0n2Pk4ggQonEyD0iPZbGHYhR5o&libraries=visualization&callback=',
		mapsDefer = $q.defer();

		//Callback function - resolving promise after maps successfully loaded
		$window.googleMapsInitialised = mapsDefer.resolve; // removed ()

		//Async loader
		var asyncLoad = function(asyncUrl, callbackName) {
			var script = document.createElement('script');

			script.src = asyncUrl + callbackName;
			document.body.appendChild(script);
		};
		
		//Start loading google maps
		asyncLoad(asyncUrl, 'googleMapsInitialised');

		//Usage: Initialiser.mapsInitialised.then(callback)
		return {
			mapsInitialised : mapsDefer.promise
		};
	}


})();

