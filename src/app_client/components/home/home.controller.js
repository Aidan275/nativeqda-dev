(function () { 

	"use strict";

	angular
	.module('nativeQDAApp')
	.controller('homeCtrl', homeCtrl);
	
	/* @ngInject */
	function homeCtrl (filesService, $scope, $filter, $compile, $window, $uibModal, logger, bsLoadingOverlayService, NgTableParams, analysisService) {
		var vm = this;

		// Bindable Functions
		vm.getFileList = getFileList;
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;
		vm.confirmDelete = confirmDelete;

		// Bindable Data
		vm.map = null;
		vm.markers = [];
		vm.currentMarker = null;
		vm.fileList = [];
		vm.pageHeader = {
			title: 'Dashboard',
			strapline: 'summary of recent activity'
		};

		// To move - may move the majority of the mapping functions into it's own directive
		var LeafIcon = L.Icon.extend({
			options: {
				shadowUrl: 'assets/img/map/markers/marker-shadow.png',
				iconSize:     [25, 41],
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
    		bsLoadingOverlayService.start({referenceId: 'home-map'});	// Start animated loading overlay
    		bsLoadingOverlayService.start({referenceId: 'file-list'});	// Start animated loading overlay
    		initMap();
    		TEMPFUNCTION_getIdForButton();	// Temp function for getting an analysis ID for the bubble chart button on the home page - delete later
    	}

    	function initMap() {
    		var mapOptions = {
				center: [-34.4054039, 150.87842999999998],	// Default position is UOW
				zoom: 4
			};

			vm.map = L.map('map-homepage', mapOptions);

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

		// If getPosition returns successfully update the user's posistion on the map
		function geoLocateUser(position) {
			vm.map.on('locationfound', onLocationFound);
			vm.map.on('locationerror', onLocationError);
			vm.map.locate({setView: true, maxZoom: 15});
		}

		function onLocationFound(response) {
			var radius = response.accuracy / 2;
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
			var userPos = response.latlng;
			var posMarker = L.marker(userPos, { icon: posIcon, zIndexOffset: -500 }).addTo(vm.map)
			.bindPopup("You are within " + $filter('formatDistance')(radius) + " from this point")
			.bindTooltip('<strong>Your Position</strong>');
			var posCicle = L.circle(userPos, {
				radius: radius,
				color: '#cb2529'
			});

			// Adds/removes the circle from the marker when focused/unfocused
			posMarker.on("popupopen", function() { 
				posCicle.addTo(vm.map); 
				vm.map.setView(userPos, zoom);
			});
			posMarker.on("popupclose", function() { vm.map.removeLayer(posCicle); });

			logger.success('User\'s location found', response, 'Success');
		}

		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		// Gets all the files from the MongoDB database to be displayed on the map and the recent files table
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				listFiles();
				addMapMarkers();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'file-list'});	// If error, stop animated loading overlays
				bsLoadingOverlayService.stop({referenceId: 'home-map'});
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				count: 5,
				page: 1,
				sorting: {lastModified: "desc"}
			}, {
				counts: [],
				dataset: vm.fileList
			});   
			bsLoadingOverlayService.stop({referenceId: 'file-list'});	// Stop animated loading overlay
		}

		// Adds markers for the files retrieved from the MongoDB database
		function addMapMarkers() {
			vm.markers = L.markerClusterGroup({showCoverageOnHover: false});

			// For each file returned from the DB, a marker with an info 
			// window is created. Each marker is then added to the 
			// markers cluster group to be displayed on the map
			vm.fileList.forEach(function(file) {
				var lat = file.coords.coordinates[1];
				var lng = file.coords.coordinates[0];
				var marker = L.marker([lat, lng], { icon: defaultIcon });

				var popupString = '<div class="info-window">' +
				'<h3>' + file.name + '</h3>' +
				'<p><strong>Created By:</strong> ' + file.createdBy + '<br />' +
				'<strong>Size:</strong> ' + $filter('formatFileSize')(file.size, 2) + '<br />' +	// uses formatFileSize filter to format the file size
				'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");	// uses date filter to format the date

				// If the file has tags, add as a comma separated list, listing each tag
				// otherwise skip and exclude the 'tags' label
				if(file.tags.length != 0) { 
					popupString += '<br /><strong>Tags:</strong> ';
					// lists each tag for current file
					popupString += file.tags.join(", ") + '</p>';
				} else {
					popupString += '</p>';
				}

				popupString += '<a ng-click="vm.viewFile(fileName, filePath)" class="btn btn-success" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(fileKey)" class="btn btn-primary" role="button">Details</a> ' +
				'<a ng-click="vm.confirmDelete(fileKey, fileName, textFileKey)" class="btn btn-danger" role="button">Delete</a>' +
				'</div>';

				// compiles the HTML so ng-click works
				var compiledPopupString = $compile(angular.element(popupString));
				var newScope = $scope.$new();

				// New scope variables for the compiled string above
				newScope.fileKey = file.key;
				newScope.fileName = file.name;
				newScope.filePath = file.path;

				marker.bindPopup(compiledPopupString(newScope)[0]);

				// Only include tooltips if the browser is not running on a mobile device
				// so mobile devices do not display the tooltip when a pin is pressed.
				if (L.Browser.mobile != true) {
					var toolTipString = '<strong>File Name:</strong> ' + file.name + '<br />' + 
					'<strong>Created By:</strong> ' + file.createdBy + '<br />' + 
					'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");

					marker.bindTooltip(toolTipString);
				}

				// When a marker is clicked and it's popup opens, the currentMaker variable is set
				// so the marker can be removed if the file is deleted.
				// Also hides the tooltip from the marker when the popup window is open
				marker.on("popupopen", function() { 
					vm.currentMarker = this; 
					var toolTip = marker.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0);
					}
				});

				// Sets the current marker to null and unhides the tooltip from the marker 
				// when the popup window is closed
				marker.on("popupclose", function() { 
					vm.currentMarker = null; 
					var toolTip = marker.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0.9);
					}
				});

				vm.markers.addLayer(marker);
			});

			// Adds the markers cluster group to the map
			vm.map.addLayer(vm.markers);
			bsLoadingOverlayService.stop({referenceId: 'home-map'});	// Stop animated loading overlay
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(name, path) {
			// Open a blank new tab while still in a trusted context to prevent a popup blocker warning
			var newTab = $window.open("about:blank", '_blank')

			// CSS and HTML for loading animation to display while fetching the signed URL
			var loaderHTML = '<style>#loader{position: absolute;left: 50%;top: 50%;border:0.5em solid rgba(70, 118, 250, 0.2);border-radius:50%;'+
			'border-top:0.5em solid #4676fa;width:75px;height:75px;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite;}'+
			'@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}'+
			'@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'+
			'<div id="loader"></div>';

			// Write the loading animation code to the new window
			newTab.document.write(loaderHTML);

			// Make a request to the server for a signed URL to download/view the requested file
			filesService.signDownloadS3(name, path)
			.then(function(response) {
				// Remove the animation 1s after the signed URL is retrieved
				setTimeout(function(){
					newTab.document.getElementById("loader").remove();
				},1000);

				// Redirect the new tab to the signed URL
				// If the file is a document, open in google docs viewer to view in the browser
				if(response.data.type === "document") {
					var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(response.data.url) + '&embedded=true';
					newTab.location = encodedUrl;
				} else {
					// Else either download or view in browser (if natively compatible)
					newTab.location = response.data.url;
				}

			}, function() {
				// If there is an error, close the new tab
				newTab.close();
			});
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

			modalInstance.result.then(function() {});
		}

		function confirmDelete(key, fileName, textFileKey) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the file '" + fileName + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteFileDB(key, fileName, textFileKey);
			});
		}

		function deleteFileDB(key, fileName, textFileKey) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(key, fileName, textFileKey);
			});
		}

		function deleteFileS3(key, fileName, textFileKey) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				// If a text file was generated for analysis, delete that file too.
				// If the original file was a text file, just delete the original file
				if(textFileKey && textFileKey != key){
					filesService.deleteFileS3({key: textFileKey});
				}
				removeMapMarker();
				logger.success("'" + fileName + "' was deleted successfully", "", "Success");
			});
		}

		function removeMapMarker() {	
			vm.markers.removeLayer(vm.currentMarker);
		}

		function TEMPFUNCTION_getIdForButton() {	// Temp function for getting an analysis ID for the bubble chart button on the home page - delete later
			analysisService.listWatsonAnalysis()
			.then(function(response) {
				vm.URL_ID = response.data[Math.floor(Math.random()*response.data.length)]._id;	// Picks random analysis ID
			});
		}

	}

})();