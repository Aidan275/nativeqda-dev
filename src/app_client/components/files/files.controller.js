(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	

	/* @ngInject */
	function filesCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile) {
		var vm = this;

		// Bindable Functions
		//vm.geocodeAddress = geocodeAddress;
		vm.getFileListS3 = getFileListS3;
		vm.viewFile = viewFile;
		vm.onFileSelect = onFileSelect;
		vm.confirmDelete = confirmDelete;
		vm.popupFileDetails = popupFileDetails;

		// Bindable Data
		vm.map = null;
		vm.marker = null;
		vm.fileList = null;
		vm.lat = -34.4054039;	// Default position is UOW
		vm.lng = 150.87842999999998;
		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';
		vm.currentPercentage = '0';

		// To move - may move the majority of the mapping functions into it's own directive
		var LeafIcon = L.Icon.extend({
			options: {
				shadowUrl: 'assets/img/map/markers/marker-shadow.png',
				iconSize:	 [25, 41],
				shadowSize:   [41, 41],
				iconAnchor:   [12.5, 41],
				shadowAnchor: [12.5, 41],
				popupAnchor:  [0, -50]
			}
		});

		var defaultIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/marker-icon-2x.png'});
		var posIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/marker-icon-pos.png'});


		activate();

		///////////////////////////

		function activate() {
			initMap();
			getFileList();
		}

		function activate() {
			initMap();
		}

		function initMap() {
			var mapOptions = {
				center: [-34.4054039, 150.87842999999998],	// Default position is UOW
				zoom: 4
			};

			vm.map = L.map('map-files-page', mapOptions);

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
			}).addTo(vm.map);

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
			}).addTo(vm.map);

			geoLocateUser();
			getFileList();
		}

		// If getPosition returns successfully, update the user's posistion on the map
		function geoLocateUser(position) {
			vm.map.on('locationfound', onLocationFound);
			vm.map.on('locationerror', onLocationError);
			vm.map.locate({setView: true, maxZoom: 15});
		}

		function onLocationFound(response) {
			var userPos = response.latlng;
			var posMarker = L.marker(userPos, { icon: posIcon, title: 'Your Position', draggable:'true' })
				.addTo(vm.map)
				.bindPopup("Drag me to change the location of the file you're uploading")
				.openPopup();

			posMarker.on('drag', function(event) {
				vm.lat = event.latlng.lat;
				vm.lng = event.latlng.lng;
				$scope.$apply();
			});

			vm.map.on('click', function(event) {
				posMarker.setLatLng(event.latlng);
				vm.lat = event.latlng.lat;
				vm.lng = event.latlng.lng;
				$scope.$apply();
			});

			logger.success('User\'s location found', response, 'Success');
		}

		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				listFiles();
				addMapMarkers();
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.fileList
			});
		}

		// Adds markers for the files retrieved from the MongoDB database
		function addMapMarkers() {
			vm.markers = L.markerClusterGroup({showCoverageOnHover: false});

			// For each file returned from the DB, a marker with an info 
			// window is created. Each marker is then added to its 
			// corresponding marker array to be displayed on the map
			vm.fileList.forEach(function(file) {
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

				vm.markers.addLayer(marker);
			});
			vm.map.addLayer(vm.markers);
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function confirmDelete(name, key) {
			var doDelete = $window.confirm("Are you sure you want to delete " + name + "?");
			if(doDelete){
				deleteFileDB(name, key);
			}
		}

		function deleteFileDB(name, key) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(name, key);
			});
		}

		function deleteFileS3(name, key) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + name + ' deleted successfully', '', 'Success');
				getFileList();
			});
		}

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			if (uploadFiles.length > 0) {
				var filename = uploadFiles[0].name;
				var type = uploadFiles[0].type;
				var query = {
					filename: filename,
					type: type
				};
				filesService.signUploadS3(query)
				.then(function(result) {
					Upload.upload({
						method: 'POST',
						url: result.data.url, 
						fields: result.data.fields, 
						file: uploadFiles[0]
					})
					.progress(function(evt) {
						vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total);
					})
					.then(function(response) {
						console.log(response.config.file.name + ' successfully uploaded to S3');
						// parses XML data response to jQuery object to be stored in the database
						var xml = $.parseXML(response.data);
						// maps the tag obects to an array of strings to be stored in the database
						var tagStrings = vm.tags.map(function(item) {
							return item['text'];
						});
						var key = result.data.fields.key;
						var url = result.data.url + '/' + key;
						var fileDetails = {
							name : filename,
							key : key,
							size : response.config.file.size,
							url : url,
							createdBy : authentication.currentUser().name,
							lat : vm.lat,
							lng : vm.lng,
							tags : tagStrings
						}
						filesService.addFileDB(fileDetails)
						.then(function(response) {
							console.log(filename + ' successfully added to DB');
							logger.success(filename + ' successfully uploaded', '', 'Success');
							getFileList();
						});
					}, function(error) {
						var xml = $.parseXML(error.data);
						logger.error($(xml).find("Message").text(), '', 'Error');
					});
				});
			}
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
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

		// need to work on back end still
		// Thinking if S3 and the DB become unsynced, such as a file in the DB that's 
		// not on S3, or vice-versa, this will re-sync them. Maybe provide settings button
		// to re-sync or do it periodically (maybe when a user logs in?).

		/*
		function syncDB(data) {
			vm.fileList = data.Contents;

			vm.fileList.forEach(function(file) {
				filesService.syncDBwithS3({key: file.Key})
				.then(function(response) {
					console.log(response);
				}, function(err) {
					console.log(err);
				});
			});

			doListFiles(data);
		}
		*/

		// not using at the moment, getting file details from DB 
		// Amazon S3 free tier only provides 2000 put requests and 20000 get requests a month
		function getFileListS3() {
			filesService.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			}, function(err) {
				console.log(err);
			});
		}
	}

})();




/*

(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	

	filesCtrl.$inject = ['mapService', '$http', '$window', '$scope', '$uibModal', 'Upload', 'NgTableParams', 'filesService', 'authentication', 'logger'];
	function filesCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger) {
		var vm = this;

		// Bindable Functions
		vm.geocodeAddress = geocodeAddress;
		vm.getFileListS3 = getFileListS3;
		vm.viewFile = viewFile;
		vm.onFileSelect = onFileSelect;
		vm.confirmDelete = confirmDelete;
		vm.popupFileDetails = popupFileDetails;

		// Bindable Data
		vm.map = null;
		vm.marker = null;
		vm.fileList = [];
		vm.lat = -34.4054039;	// Default position is UOW
		vm.lng = 150.87842999999998;
		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';
		vm.currentPercentage = '0';

		activate();

		///////////////////////////

		function activate() {
			initMap();
			getFileList();
		}

		function initMap() {
			var position = new google.maps.LatLng(vm.lat, vm.lng);
			var mapCanvas = document.getElementById('map-files-page');
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

			vm.map = new google.maps.Map(mapCanvas, mapOptions);

			vm.marker = new google.maps.Marker({
				draggable: true,
				position: position,
				map: vm.map,
				title: 'Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng
			});

			google.maps.event.addListener(vm.marker, 'dragend', function(event) {
				vm.lat = event.latLng.lat();
				vm.lng = event.latLng.lng();
				vm.marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
				$scope.$apply();
			});

			google.maps.event.addListener(vm.map, 'click', function(event) {
				vm.lat = event.latLng.lat();
				vm.lng = event.latLng.lng();
				vm.marker.setPosition(event.latLng);
				vm.marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
				$scope.$apply();
			});

			mapService.getPosition(getGeoData);
		}

		function getGeoData(position) {
			vm.lat = position.coords.latitude;
			vm.lng = position.coords.longitude;
			updateUserPos();
		}

		function updateUserPos() {
			var userPos = new google.maps.LatLng(vm.lat, vm.lng);
			vm.marker.setPosition(userPos);
			vm.marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
			vm.map.setZoom(13);
			vm.map.panTo(userPos);
			$scope.$apply();
		}

		function geocodeAddress() {
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address': vm.address}, function(results, status) {
				if (status === 'OK') {
					vm.lat = results[0].geometry.location.lat();
					vm.lng = results[0].geometry.location.lng();
					vm.formattedAddress = results[0].formatted_address;

					vm.marker.setPosition(results[0].geometry.location);
					vm.marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);

					vm.map.panTo(new google.maps.LatLng(vm.lat,vm.lng));

					$scope.$apply();
				} else if (status === 'ZERO_RESULTS') {
					toastr.warning('Warning: Address not found', 'Warning', { "positionClass": "toast-top-center"})
				} else {
					toastr.error('Geocode failed: ' + status, 'Error', { "positionClass": "toast-top-center"})
				}
			});
		}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				listFiles();
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {lastModified: "desc"}
			}, {
				dataset: vm.fileList
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function confirmDelete(name, key) {
			var doDelete = $window.confirm("Are you sure you want to delete " + name + "?");
			if(doDelete){
				deleteFileDB(name, key);
			}
		}

		function deleteFileDB(name, key) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(name, key);
			});
		}

		function deleteFileS3(name, key) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + name + ' deleted successfully', '', 'Success');
				getFileList();
			});
		}

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			if (uploadFiles.length > 0) {
				var filename = uploadFiles[0].name;
				var type = uploadFiles[0].type;
				var query = {
					filename: filename,
					type: type
				};
				filesService.signUploadS3(query)
				.then(function(result) {
					Upload.upload({
						method: 'POST',
						url: result.data.url, 
						fields: result.data.fields, 
						file: uploadFiles[0]
					})
					.progress(function(evt) {
						vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total);
					})
					.then(function(response) {
						console.log(response.config.file.name + ' successfully uploaded to S3');
						// parses XML data response to jQuery object to be stored in the database
						var xml = $.parseXML(response.data);
						// maps the tag obects to an array of strings to be stored in the database
						var tagStrings = vm.tags.map(function(item) {
							return item['text'];
						});
						var key = result.data.fields.key;
						var url = result.data.url + '/' + key;
						var fileDetails = {
							name : filename,
							key : key,
							size : response.config.file.size,
							url : url,
							createdBy : authentication.currentUser().name,
							lat : vm.lat,
							lng : vm.lng,
							tags : tagStrings
						}
						filesService.addFileDB(fileDetails)
						.then(function(response) {
							console.log(filename + ' successfully added to DB');
							logger.success(filename + ' successfully uploaded', '', 'Success');
							getFileList();
						});
					}, function(error) {
						var xml = $.parseXML(error.data);
						logger.error($(xml).find("Message").text(), '', 'Error');
					});
				});
			}
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
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

		// need to work on back end still
		// Thinking if S3 and the DB become unsynced, such as a file in the DB that's 
		// not on S3, or vice-versa, this will re-sync them. Maybe provide settings button
		// to re-sync or do it periodically (maybe when a user logs in?).

		function syncDB(data) {
			vm.fileList = data.Contents;

			vm.fileList.forEach(function(file) {
				filesService.syncDBwithS3({key: file.Key})
				.then(function(response) {
					console.log(response);
				}, function(err) {
					console.log(err);
				});
			});

			doListFiles(data);
		}


		// not using at the moment, getting file details from DB 
		// Amazon S3 free tier only provides 2000 put requests and 20000 get requests a month
		function getFileListS3() {
			filesService.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			}, function(err) {
				console.log(err);
			});
		}
	}

})();

*/