(function () {

	angular
	.module('nativeQDAApp')
	.controller('mapCtrl', mapCtrl);

	mapCtrl.$inject = ['$scope', 'nativeQDAData', 'geolocation', 'GoogleMapsInitialiser', 'authentication', 'events'];
	function mapCtrl ($scope, nativeQDAData, geolocation, GoogleMapsInitialiser, authentication, events) {
		var vm = this;
		var lat = -34.406749;
		var lng = 150.878473;

		vm.getData = function (position) {
			lat = position.coords.latitude;
			lng = position.coords.longitude;
			userDetails = {
				email : authentication.currentUser().email,
				lat : lat,
				lng : lng
			}
			events.event(userDetails);
			initMap(lat ,lng);
		};

		vm.showError = function (error) {
			$scope.$apply(function() {
				vm.message = error.message;
				console.log(vm.message);
				initMap(lat ,lng);
			});
		};

		vm.noGeo = function () {
			$scope.$apply(function() {
				vm.message = "Geolocation is not supported by this browser.";
				console.log(vm.message);
				initMap(lat ,lng);
			});
		};

		geolocation.getPosition(vm.getData,vm.showError,vm.noGeo);

		function initMap(lat, lng) {
			GoogleMapsInitialiser.mapsInitialised
			.then(function(){
				var location = new google.maps.LatLng(lat, lng);
				var mapCanvas = document.getElementById('map');
				var mapOptions = {
					center: location,
					zoom: 5,
					panControl: false,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControl: true,
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DEFAULT,
						position: google.maps.ControlPosition.TOP_RIGHT
					},
				}
				var map = new google.maps.Map(mapCanvas, mapOptions);

				var icons = {
					australia: {
						icon: '/images/map/icons/kangaroo-markers/kangaroo-marker.png'
					},
					newZealand: {
						icon: '/images/map/icons/kiwi-markers/kiwi-marker.png'
					},
					newCaledonia: {
						icon: '/images/map/icons/kagu-markers/kagu-marker.png'
					}
				};

				var features = [
				{
					position: new google.maps.LatLng(-34.195122, 145.613610),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-27.782105, 144.988068),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-31.617175, 149.755251),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-34.183426, 145.531326),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-23.004057, 150.208288),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-23.367210, 148.562199),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-27.149085, 148.392517),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-27.171054, 148.692928),
					type: 'australia'
				}, {
					position: new google.maps.LatLng(-21.676721, 166.040641),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-21.198481, 165.322936),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-20.650302, 164.739780),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-20.513840, 164.399452),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-20.765698, 164.410470),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-20.625109, 164.786398),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-22.259586, 166.453261),
					type: 'newCaledonia'
				}, {
					position: new google.maps.LatLng(-40.768675, 175.207908),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-41.114069, 174.107308),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-41.101032, 175.183516),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-40.145982, 176.593862),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-39.454753, 173.929295),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-39.060873, 176.168224),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-43.974486, 169.417745),
					type: 'newZealand'
				}, {
					position: new google.maps.LatLng(-45.779950, 170.528945),
					type: 'newZealand'
				}
				];

				var kangarooMarkers = [];
				var kiwiMarkers = [];
				var kaguMarkers = [];

				var contentString = '<div class="info-window">' +
				'<h3>Data</h3>' +
				'<div class="info-content">' +
				'<p>Data collected from interview</p>' +
				'<a href="/files">Interview.doc</a>' +
				'</div>' +
				'</div>';

				var infowindow = new google.maps.InfoWindow({
					content: contentString,
					maxWidth: 400
				});

				features.forEach(function(feature) {
					var marker = new google.maps.Marker({
						position: feature.position,
						icon: icons[feature.type].icon,
					});

					marker.addListener('click', function () {
						infowindow.open(map, marker);
					});


					if(marker.icon == '/images/map/icons/kangaroo-markers/kangaroo-marker.png'){
						kangarooMarkers.push(marker);
					} else if(marker.icon == '/images/map/icons/kiwi-markers/kiwi-marker.png'){
						kiwiMarkers.push(marker);
					} else if(marker.icon == '/images/map/icons/kagu-markers/kagu-marker.png'){
						kaguMarkers.push(marker);
					}
				});

				var kangarooMarkerCluster = new MarkerClusterer(map, kangarooMarkers, {imagePath: '/images/map/icons/kangaroo-markers/m'});
				var kiwiMarkerCluster = new MarkerClusterer(map, kiwiMarkers, {imagePath: '/images/map/icons/kiwi-markers/m'});
				var kaguMarkerCluster = new MarkerClusterer(map, kaguMarkers, {imagePath: '/images/map/icons/kagu-markers/m'});

			});
}
}


})();