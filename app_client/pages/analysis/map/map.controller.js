(function () {

	angular
	.module('nativeQDAApp')
	.controller('mapCtrl', mapCtrl);

	mapCtrl.$inject = ['mapService', 'filesService', '$scope', '$filter', '$compile', '$window', '$uibModal', 'logger'];
	function mapCtrl (mapService, filesService, $scope, $filter, $compile, $window, $uibModal, logger) {
		var vm = this;

		var map = null;
		var markers;

		vm.currentMarker = null;

		vm.getFileList = getFileList;
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;
		vm.confirmDelete = confirmDelete;

		var LeafIcon = L.Icon.extend({
			options: {
				shadowUrl: '/markers/marker-shadow.png',
				iconSize:     [25, 41],
				shadowSize:   [41, 41],
				iconAnchor:   [12.5, 41],
				shadowAnchor: [12.5, 41],
				popupAnchor:  [0, -50]
			}
		});

		var defaultIcon = new LeafIcon({iconUrl: '/markers/marker-icon.png'});
		var posIcon = new LeafIcon({iconUrl: '/markers/marker-icon-pos.png'});

		activate();

		///////////////////////////

		function activate() {
			initMap();
		}

		function initMap(coords) {
			mapOptions = {
				center: [-34.4054039, 150.87842999999998],	// Default position is UOW
				zoom: 4
			};

			map = L.map('map', mapOptions);

			var maxZoom = 22;

			var mapboxLight = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.light',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxDark = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.dark',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxSatellite = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.satellite',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxStreetsSatellite = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.streets-satellite',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxWheatpaste = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.wheatpaste',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxStreetsBasic = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.streets-basic',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			}).addTo(map);

			var mapboxComic = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.comic',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxOutdoors = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.outdoors',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxRunBikeHike = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.run-bike-hike',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxPencil = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.pencil',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxPirates = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.pirates',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxEmerald = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.emerald',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var mapboxHighContrast = L.tileLayer('https://api.mapbox.com/v4/{map}/{z}/{x}/{y}.png?access_token={accessToken}', {
				map: 'mapbox.high-contrast',
				accessToken: 'pk.eyJ1IjoiYWlkYW4yNzUiLCJhIjoiY2o0MWVrMmFxMGVuNjJxbnlocmV6ZDJ0cCJ9.h77mANND4PPZz9U1z4OC3w',
				maxZoom: maxZoom
			})

			var roadMutant = L.gridLayer.googleMutant({
				maxZoom: maxZoom,
				type:'roadmap'
			})

			var satMutant = L.gridLayer.googleMutant({
				maxZoom: maxZoom,
				type:'satellite'
			});

			var terrainMutant = L.gridLayer.googleMutant({
				maxZoom: maxZoom,
				type:'terrain'
			});

			var hybridMutant = L.gridLayer.googleMutant({
				maxZoom: maxZoom,
				type:'hybrid'
			});

			var trafficMutant = L.gridLayer.googleMutant({
				maxZoom: maxZoom,
				type:'roadmap'
			});

			trafficMutant.addGoogleLayer('TrafficLayer');

			// Might be worth putting this in the user settings, or at least a setting for the default map
			L.control.layers({
				'Mapbox Light': mapboxLight,
				'Mapbox Dark': mapboxDark,
				'Mapbox Satellite': mapboxSatellite,
				'Mapbox Streets Satellite': mapboxStreetsSatellite,
				'Mapbox Wheatpaste': mapboxWheatpaste,
				'Mapbox Streets Basic': mapboxStreetsBasic,
				'Mapbox Outdoors': mapboxOutdoors,
				'Mapbox Run Bike Hike': mapboxRunBikeHike,
				'Mapbox Pencil': mapboxPencil,
				'Mapbox Pirates': mapboxPirates,
				'Mapbox Emerald': mapboxEmerald,
				'Mapbox High Contrast': mapboxHighContrast,
				'Google Roadmap': roadMutant,
				'Google Aerial': satMutant,
				'Google Terrain': terrainMutant,
				'Google Hybrid': hybridMutant,
				'Google Traffic': trafficMutant
			}, {}, {
				collapsed: true
			}).addTo(map);

			geoLocateUser();
			
			getFileList();
		}

		// If getPosition returns successfully update the user's posistion on the map
		function geoLocateUser(position) {
			map.on('locationfound', onLocationFound);
			map.on('locationerror', onLocationError);
			map.locate({setView: true, maxZoom: 15});
		}

		function onLocationFound(response) {
			var radius = response.accuracy / 2;
			var userPos = response.latlng;
			var posMarker = L.marker(userPos, { icon: posIcon, title: 'Your Position' }).addTo(map).bindPopup("You are within " + radius + " meters from this point");
			var posCicle = L.circle(userPos, {
				radius: radius,
				color: '#cb2529'
			});

			// Adds/removes the circle from the marker when focused/unfocused
			posMarker.on("popupopen", function() { 
				posCicle.addTo(map); 
				map.setView(userPos, 18);
			});
			posMarker.on("popupclose", function() { map.removeLayer(posCicle); });

			logger.success('User\'s location found', response, 'Success');
		}

		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				var fileList = response.data;
				addMapMarkers(fileList);
			});
		}

		// Adds markers for the files retrieved from the MongoDB database
		function addMapMarkers(fileList) {
			markers = L.markerClusterGroup({showCoverageOnHover: false});

			// For each file returned from the DB, a marker with an info 
			// window is created. Each marker is then added to its 
			// corresponding marker array to be displayed on the map
			fileList.forEach(function(file) {
				var marker = L.marker([file.coords.lat, file.coords.lng], { icon: defaultIcon, title: file.name });

				var contentString = '<div class="info-window">' +
				'<h3>' + file.name + '</h3>' +
				'<p>Created By: ' + file.createdBy + '</p>' +
				'<p>Size: ' + $filter('formatFileSize')(file.size, 2) + '</p>' +	// uses formatFileSize filter to format the file size
				'<p>Last Modified: ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a") + '</p>';	// uses date filter to format the date

				// If the file has tags add an unsorted list, listing each tag
				// otherwise skip and exclude the 'tags' label
				if(file.tags.length != 0) { 
					contentString += '<p>Tags: </p>' +
					'<ul>';
					// lists each tag for current file
					file.tags.forEach(function(tag){
						contentString += '<li>' + tag + '</li>';
					});
					contentString += '</ul>';
				}

				contentString += '<a ng-click="vm.viewFile(\'' + file.key + '\')" class="btn btn-success" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(\'' + file.key + '\')" class="btn btn-primary" role="button">Details</a> ' +
				'<a ng-click="vm.confirmDelete(\'' + file.key + '\', \'' + file.name + '\')" class="btn btn-danger" role="button">Delete</a>' +
				'</div>';

				// compiles the HTML so ng-click works
				var compiledContentString = $compile(contentString)($scope)

				marker.bindPopup(compiledContentString[0]);

				// When a marker is clicked and it's popup opens, the currentMaker variable is set
				// so the marker can be removed if the file is deleted
				marker.on("popupopen", function() { vm.currentMarker = this; });

				markers.addLayer(marker);
			});
			map.addLayer(markers);
		}

		// Get a signed URL to download the requested file from S3 
		// and if successful, open the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetails as vm',
				size: 'lg',
				resolve: {
					key: function () {
						return key;
					}
				}
			});

			modalInstance.result.then(function() {});
		}

		function confirmDelete(key, fileName) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				deleteFileDB(key, fileName);
			}
		}

		function deleteFileDB(key, fileName) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(key, fileName);
			});
		}

		function deleteFileS3(key, fileName) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + fileName + ' deleted successfully', '', 'Success');
				removeMapMarker();
			});
		}

		function removeMapMarker() {	
			markers.removeLayer(vm.currentMarker);
		}
	}

})();

/* ====== OLD CODE USING GOOGLE MAPS API ======

// Tried using leaflet instead due to the vector tiles, smoother transitions, and clustering features.
// Can load a variety of tiles to be used including Google Maps and MapBox tiles. 

		function initMap(coords) {
			var position = new google.maps.LatLng(-34.4054039, 150.87842999999998);	// Default position is UOW
			var mapCanvas = document.getElementById('map');
			var mapOptions = {
				center: position,
				zoom: 4,
				panControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: true,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle.DEFAULT,
					position: google.maps.ControlPosition.TOP_RIGHT
				}
			}

			map = new google.maps.Map(mapCanvas, mapOptions);

			mapService.getPosition(getGeoData);
			getFileList();
		}

		// If getPosition returns successfully update the user's posistion on the map
		function getGeoData(position) {
			updateUserPos(position.coords.latitude, position.coords.longitude);
		}

		function updateUserPos(lat, lng) {
			var userPos = new google.maps.LatLng(lat, lng);
			var marker = new google.maps.Marker({
				position: userPos,
				map: map,
				title: 'Your Position'
			});
			map.setZoom(13);
			map.panTo(userPos);
		}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				var fileList = response.data;
				clearMarkers();
				addMapMarkers(fileList);
			});
		}

		function clearMarkers() {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];

			if(markerCluster)
				markerCluster.clearMarkers();
		}

		// Adds markers for the files retrieved from the MongoDB database
		function addMapMarkers(fileList) {
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

			var icon = {
				url: "icons/method-draw-image (3).svg",
				fillColor: '#eb4139',
				fillOpacity: 1,
				anchor: new google.maps.Point(0,0),
				scaledSize: new google.maps.Size(50,50)
			}

			var infowindow = new google.maps.InfoWindow();

			var markerId = 0;
			// For each file returned from the DB, a marker with an info 
			// window is created. Each marker is then added to its 
			// corresponding marker array to be displayed on the map
			fileList.forEach(function(file) {
				var marker = new google.maps.Marker({
					id: ++markerId,
					position: new google.maps.LatLng(file.coords.lat, file.coords.lng),
					//icon: icon,
					title: file.name
				});

				var contentString = '<div class="info-window">' +
				'<h3>' + file.name + '</h3>' +
				'<p>Created By: ' + file.createdBy + '</p>' +
				'<p>Size: ' + $filter('formatFileSize')(file.size, 2) + '</p>' +	// uses formatFileSize filter to format the file size
				'<p>Last Modified: ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a") + '</p>';	// uses date filter to format the date

				// If the file has tags add an unsorted list, listing each tag
				// otherwise skip and exclude the 'tags' label
				if(file.tags.length != 0) { 
					contentString += '<p>Tags: </p>' +
					'<ul>';
					// lists each tag for current file
					file.tags.forEach(function(tag){
						contentString += '<li>' + tag + '</li>';
					});
					contentString += '</ul>';
				}

				contentString += '<a ng-click="vm.viewFile(\'' + file.key + '\')" class="btn btn-success" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(\'' + file.key + '\')" class="btn btn-primary" role="button">Details</a> ' +
				'<a ng-click="vm.confirmDelete(\'' + file.key + '\', \'' + file.name + '\', \'' + markerId + '\')" class="btn btn-danger" role="button">Delete</a>' +
				'</div>';

				// compiles the HTML so ng-click works
				var compiledContentString = $compile(contentString)($scope)

				marker.addListener('click', function () {
					infowindow.setContent(compiledContentString[0]);
					infowindow.open(map, marker);
				});

				google.maps.event.addListener(map, 'click', function(){
					infowindow.close(map, marker);
				});

				markers.push(marker);

			});
			markerCluster = new MarkerClusterer(map, markers, {imagePath: '/images/map/icons/kangaroo-markers/m'});
			markerCluster.setMaxZoom(20);
		}

		function removeMapMarker(markerId) {	
			// Find the marker index for markerId, will return -1 if not found 
			var markerIndex = markers.findIndex(function(obj){return obj.id == markerId});

			// Remove the marker from map then remove from markers array
			if (markerIndex > -1) {
				markers[markerIndex].setMap(null);
				markers.splice(markerIndex, 1);
			}

			// Probably don't need to search the markerclusters for the marker index since it should 
			// be identical to the index found earlier for the markers array
			markerIndex = markerCluster.markers_.findIndex(function(obj){return obj.id == markerId});

			// Remove the marker from the markers array in the markerCluster object
			if (markerIndex > -1) {
				markerCluster.markers_.splice(markerIndex, 1);
			}
		}

		// Get a signed URL to download the requested file from S3 
		// and if successful, open the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetails as vm',
				size: 'lg',
				resolve: {
					key: function () {
						return key;
					}
				}
			});

			modalInstance.result.then(function() {

			});
		}

		function confirmDelete(key, fileName, markerId) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				removeMapMarker(markerId);
				oms.unspiderfy();
				//deleteFileDB(key, fileName, markerId);
			}
		}

		function deleteFileDB(key, fileName, markerId) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				//deleteFileS3(key, fileName, markerId);
			});
		}

		function deleteFileS3(key, fileName, markerId) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + fileName + ' deleted successfully', '', 'Success');

			});
		}
*/