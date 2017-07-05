(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesUploadCtrl', filesUploadCtrl);
	

	/* @ngInject */
	function filesUploadCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile, analysisService) {
		var vm = this;

		// Bindable Functions
		//vm.geocodeAddress = geocodeAddress;
		vm.onFileSelect = onFileSelect;
		vm.uploadFile = uploadFile;

		// Bindable Data
		vm.map = null;
		vm.marker = null;
		vm.markers = L.markerClusterGroup({showCoverageOnHover: false});
		vm.posMarker = null;
		vm.posMarkerMoved = false;		// After moving the marker, the accuracy circle will be removed, i.e. the posMarkerMoved bool will be true
		vm.fileList = null;
		vm.lat = -34.4054039;	// Default position is UOW
		vm.lng = 150.87842999999998;
		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';
		vm.currentPercentage = '0';
		vm.file = null;
		vm.pageHeader = {
			title: 'Upload Files'
		};

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

			// Create new marker for the file upload position - default position
			vm.posMarker = L.marker([vm.lat, vm.lng], { icon: posIcon, draggable: true, zIndexOffset: 1000 })
			.addTo(vm.map)
			.bindTooltip('<strong>File Upload Position</strong>')
			.bindPopup(	"<p>Drag me to change the file upload position</p>");

			// Event for when the file position marker is dragger
			vm.posMarker.on('drag', function(event) {
				updatePosMarker(event);
			});

			// Event for when map is clicked, moves the file position marker to the location clicked
			vm.map.on('click', function(event) {
				vm.posMarker.setLatLng(event.latlng);
				updatePosMarker(event);
			});

			geoLocateUser();	// Find the position of the user
			getFileList();		// Gets the file list form the DB
		}

		function updatePosMarker(event) {
			if(!vm.posMarkerMoved){
				vm.posMarkerMoved = true;
				vm.posMarker.setPopupContent("<p>Drag me to change the file upload position</p>");
			}
			vm.lat = event.latlng.lat;
			vm.lng = event.latlng.lng;
			$scope.$apply();
		}

		// If getPosition returns successfully, update the user's posistion on the map
		function geoLocateUser(position) {
			vm.map.on('locationfound', onLocationFound);
			vm.map.on('locationerror', onLocationError);
			vm.map.locate({setView: true, maxZoom: 15});
		}

		function onLocationFound(response) {
			// If the user's location is found, the position of the file marker is updated
			var userPos = response.latlng;
			var radius = response.accuracy / 2;

			vm.lat = userPos.lat;
			vm.lng = userPos.lng;
			$scope.$apply();		// Use $scope.$apply() to update the lat and lng on the page

			// Set the zoom level depending on the radius of the accuracy circle. Maybe a bit much
			var zoom = (
				radius < 9 ? 22 : 
				radius > 8 && radius < 17 ? 21 : 
				radius > 16 && radius < 32 ? 20 : 
				radius > 31 && radius < 63 ? 19 : 
				radius > 62 && radius < 126 ? 18 : 
				radius > 125 && radius < 251 ? 17 : 
				radius > 250 && radius < 551 ? 16 : 
				radius > 550 && radius < 1101 ? 15 :
				radius > 1100 && radius < 2201 ? 14 : 
				radius > 2200 && radius < 4401 ? 13 : 
				radius > 4400 && radius < 8801 ? 12 : 
				radius > 8800 && radius < 17601 ? 11 : 
				radius > 17600 && radius < 35201 ? 10 :
				radius > 35200 && radius < 70401 ? 9 : 
				radius > 70400 && radius < 140801 ? 8 : 
				radius > 140800 && radius < 281601 ? 7 : 
				radius > 281600 && radius < 563201 ? 6 : 
				radius > 563200 && radius < 1126401 ? 5 :  		
				radius > 1126400 && radius < 2252801 ? 4 :  		
				radius > 2252800 && radius < 4505601 ? 3 :  		
				radius > 4505600 && radius < 9011201 ? 2 :  		
				radius > 9011200 && radius < 18022401 ? 1 : 1
				);

			// Move the marker and update the popup content of the marker 
			vm.posMarker.setLatLng(userPos);
			vm.posMarker.setPopupContent("	<p>You are within " + $filter('formatDistance')(radius) + " from this point<br />" +
				"Drag me to change the file upload position</p>");

			// Create a circle to represent the accuracy radius
			var posCicle = L.circle(userPos, {
				radius: radius,
				color: '#cb2529'
			});

			// Adds/removes the accuracy circle from the marker when focused/unfocused (only if the marker hasn't been moved).
			vm.posMarker.on("popupopen", function() {
				if(!vm.posMarkerMoved) { 
					posCicle.addTo(vm.map); 
					vm.map.setView(userPos, zoom);
				}
			});

			vm.posMarker.on("popupclose", function() { 
				if(!vm.posMarkerMoved) {
					vm.map.removeLayer(posCicle); 
				}
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
				addMapMarkers();
			});
		}

		// Adds markers for the files retrieved from the MongoDB database
		function addMapMarkers() {
			// For each file returned from the DB, a marker is added to the 
			// marker Cluster Group to be displayed on the map. 
			// If the marker is clicked, it sets the upload marker to the file's location.
			vm.fileList.forEach(function(file) {
				var lat = file.coords.coordinates[1];
				var lng = file.coords.coordinates[0];
				var marker = L.marker([lat, lng], { icon: defaultIcon })
				.bindTooltip(	'<strong>File Name:</strong> ' + file.name + '<br />' + 
					'<strong>Created By:</strong> ' + file.createdBy + '<br />' + 
					'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a"));
				// When a marker is clicked, the posMarker is moved to it
				marker.on("click ", function() { 
					vm.posMarker.setLatLng([lat, lng]);
					updatePosMarker( { latlng: { lat: lat, lng: lng } } );
				});

				vm.markers.addLayer(marker);
			});
			vm.map.addLayer(vm.markers);
		}

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			//convertFile();
			if (uploadFiles.length > 0) {
				vm.file = uploadFiles[0];
				vm.fileInfo = {
					name: vm.file.name,
					type: vm.file.type
				};
			}
		}

		function uploadFile() {
			filesService.signUploadS3(vm.fileInfo)
			.then(function(result) {
				Upload.upload({
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: vm.file
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
					var url = result.data.url + '/' + encodeURIComponent(key);	// Encode the key for the API URL incase it includes reserved characters (e.g '+', '&')
					var fileDetails = {
						name : vm.fileInfo.name,
						key : key,
						size : response.config.file.size,
						url : url,
						createdBy : authentication.currentUser().name,
						coords : { 
							lat : vm.lat,
							lng : vm.lng
						},
						tags : tagStrings
					}
					console.log(key);
					filesService.addFileDB(fileDetails)
					.then(function(response) {
						vm.fileList.push(response.data);
						console.log(vm.fileInfo.name + ' successfully added to DB');
						logger.success(vm.fileInfo.name + ' successfully uploaded', '', 'Success');
						
						updateMapMarkers();
					});
				}, function(error) {
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
				});
			});
		}

		function convertFile(){

			var processData = {
				"apikey": "tZEO_JfLuf7_fJ1w6k8V31bVivFwcir6CODSjBtwj8erYWVY_H_7g5FqgNzqgh56UTllagqT8dWXVIl3AaO_fA",
				"inputformat": "pdf",
				"outputformat": "txt"
			};

			$http.post('https://api.cloudconvert.com/process', processData).then(completeProcessConvert)
			.catch(failedProcessConvert);

			function failedProcessConvert(e) { console.log(e); }

			function completeProcessConvert(data) { 
				var convertData = {
					"input": {
						"s3": {
							"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
							"secretaccesskey": "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",
							"bucket": "nativeqda-assets-dev"
						}
					},
					"file": "txt/test/test01.pdf",
					"outputformat": "txt",
					"output": {
						"s3": {
							"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
							"secretaccesskey": "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",
							"bucket": "nativeqda-assets-dev",
							"path": "txt/test/test01.pdf.txt"
						}
					}
				};

				console.log(convertData); 
				console.log(data); 

				$http.post(data.data.url, convertData).then(completeConvert)
				.catch(failedConvert);

				function failedConvert(e) { console.log(e); }

				function completeConvert(data) { 
					console.log(data); 
				}
			}
			


		}

		/*
		var processData = {
			"apikey": "tZEO_JfLuf7_fJ1w6k8V31bVivFwcir6CODSjBtwj8erYWVY_H_7g5FqgNzqgh56UTllagqT8dWXVIl3AaO_fA",
			"mode": "combine",
			"outputformat": "pdf"
		};

		$http.post('https://api.cloudconvert.com/process', processData).then(completeProcessConvert)
		.catch(failedProcessConvert);

		function failedProcessConvert(e) { console.log(e); }

		function completeProcessConvert(data) { 
			var convertData = {
				"mode": "combine",
				"input": {
					"s3": {
						"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
						"secretaccesskey": "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",
						"bucket": "nativeqda-assets-dev"
					}
				},
				"files": [
				"2017/07/34257484d630831da908-ALICE.docx",
				"2017/07/2d08844c50983787d101-I Have a Dream.pdf",
				"2017/07/ef24406f5e953d6ceba1-Anna Pavlovna's drawing room was gradually filling.txt"
				],
				"outputformat": "pdf",
				"output": {
					"s3": {
						"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
						"secretaccesskey": "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",
						"bucket": "nativeqda-assets-dev",
						"path": "txt/test/test01.pdf"
					}
				},
				"wait": true
			};

			console.log(convertData); 
			console.log(data); 

			$http.post(data.data.url, convertData).then(completeConvert)
			.catch(failedConvert);

			function failedConvert(e) { console.log(e); }

			function completeConvert(data) { 
				console.log(data); 
			}
		}
		*/




		/*
		var processData = {
			"apikey": "tZEO_JfLuf7_fJ1w6k8V31bVivFwcir6CODSjBtwj8erYWVY_H_7g5FqgNzqgh56UTllagqT8dWXVIl3AaO_fA",
			"inputformat": "pdf",
			"outputformat": "txt"
		};

		$http.post('https://api.cloudconvert.com/process', processData).then(completeProcessConvert)
		.catch(failedProcessConvert);

		function failedProcessConvert(e) { console.log(e); }

		function completeProcessConvert(data) { 
			var convertData = {
				"input": {
					"s3": {
						"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
						"secretaccesskey": "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",
						"bucket": "nativeqda-assets-dev"
					}
				},
				"file": key,
				"outputformat": "txt",
				"output": {
					"s3": {
						"accesskeyid": "AKIAJ5RRRRKPR7ICCGTA",
						"secretaccesskey": "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",
						"bucket": "nativeqda-assets-dev",
						"path": "txt/" + key
					}
				}
			};

			console.log(convertData); 
			console.log(data); 

			$http.post(data.data.url, convertData).then(completeConvert)
			.catch(failedConvert);

			function failedConvert(e) { console.log(e); }

			function completeConvert(data) { 
				console.log(data); 
			}
		}
		*/


		function updateMapMarkers() {
			vm.markers.clearLayers()
			addMapMarkers();
		}
	}

})();