(function () {

	angular
	.module('nativeQDAApp')
	.controller('mapCtrl', mapCtrl);

	mapCtrl.$inject = ['$scope', '$compile', '$window', '$filter', 'geolocService', 'initMapService', 'authentication', 'events', 'filesService'];
	function mapCtrl ($scope, $compile, $window, $filter, geolocService, initMapService, authentication, events, filesService) {
		var vm = this;
		var lat = -34.406749;
		var lng = 150.878473;
		var mapZoom = 5;
		var fileList;

		vm.getData = function (position) {
			lat = position.coords.latitude;
			lng = position.coords.longitude;
			events.event({email : authentication.currentUser().email,});
			mapZoom = 13;
			initMap(lat, lng);
		};

		vm.showError = function (error) {
			$scope.$apply(function() {
				vm.message = error.message;
				console.log(vm.message);
				initMap(lat, lng);
			});
		};

		vm.noGeo = function () {
			$scope.$apply(function() {
				vm.message = "Geolocation is not supported by this browser.";
				console.log(vm.message);
				initMap(lat, lng);
			});
		};

		vm.getFileList = function() {
			filesService.getFileListDB()
			.then(function(response) {
				fileList = response.data;
				geolocService.getPosition(vm.getData,vm.showError,vm.noGeo);
			}, function(e) {
				console.log(e);
			});
			return false;
		}

		vm.getFileList();

		// Get signed URL to download the requested file from S3 
		// and if successful, open the signed URL in a new tab
		vm.viewFile = function(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				var signedURL = response.data;
				$window.open(response.data, '_blank');
			}, function(err) {
				console.log(err);
			});
		}

		function initMap(lat, lng) {
			initMapService.init
			.then(function(){
				var location = new google.maps.LatLng(lat, lng);
				var mapCanvas = document.getElementById('map');
				var mapOptions = {
					center: location,
					zoom: mapZoom,
					panControl: false,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControl: true,
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DEFAULT,
						position: google.maps.ControlPosition.TOP_RIGHT
					}
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

				var kangarooMarkers = [];
				var kiwiMarkers = [];
				var kaguMarkers = [];

				fileList.forEach(function(file) {
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(file.coords.lat, file.coords.lng),
						icon: icons['australia'].icon,
						title: file.key
					});

					var contentString = '<div class="info-window">' +
					'<h3>' + file.key + '</h3>' +
					'<p>Created By: ' + file.createdBy + '</p>' +
					'<p>Size: ' + $filter('formatFileSize')(file.size, 2) + '</p>' +	// using formatFileSize filter to format the file size
					'<p>Last Modified: ' + file.lastModified + '</p>' +
					'<p>Tags: ';

					// lists each tag for current file
					file.tags.forEach(function(tag){
						contentString += tag + ', ';
					});

					contentString += '<p><a ng-click="vm.viewFile(\'' + file.key + '\')" class="btn btn-success" role="button">View file</a></p>' +
					//'<p><a href="' + file.url + '" target="_blank">' + file.url + '</a></p>' + 	// will add make public button which changes the ACL permissions and shows public URL
					'</div>';

					// compiles the HTML so ng-click works
					var compiledContentString = $compile(contentString)($scope)

					var infowindow = new google.maps.InfoWindow({
						content: compiledContentString[0]
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