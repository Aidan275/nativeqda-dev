/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name map.controller:mapCtrl
* @requires $scope
* @requires $filter
* @requires $compile
* @requires $window
* @requires $uibModal
* @requires bsLoadingOverlayService
* @requires services.service:filesService
* @requires services.service:s3Service
* @requires services.service:mapService
* @requires services.service:authService
* @requires services.service:logger
* @description The main map page of the application. Displays all the files from the database based
* on their geographical location.
*
* Ideally the bulk of this functionality should be moved to a directive where it can then simply be 
* added to multiple pages but the slight differences each map has for each page would result in too
* much work/time so this will suffice for now.
*
* Currently this file is to long. In the future these functions should be split up where possible.
*
*/

(function () {

	'use strict';

	angular
	.module('map')
	.controller('mapCtrl', mapCtrl);

	/* @ngInject */
	function mapCtrl($scope, $filter, $compile, $window, $uibModal, bsLoadingOverlayService, filesService, s3Service, mapService, authService, logger) {
		var vm = this;

		/* Bindable Functions */
		/* File marker functions */
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;
		vm.fileSearchHover = fileSearchHover;
		vm.fileSearchClick = fileSearchClick;

		/* Marker link functions */
		/* These are for the arrows between markers depicting dependencies */
		vm.confirmLinkDelete = confirmLinkDelete;
		vm.selectDependent = selectDependent;
		vm.toggleLinks = toggleLinks;
		vm.cancelAddingLink = cancelAddingLink;

		/* Bindable Data */
		vm.map = null;
		vm.posMarker = null;
		vm.lat = -34.4054039;	/* Default position is UOW */
		vm.lng = 150.87842999999998;
		vm.sidebar = null;
		vm.currentUser = authService.currentUser();

		/* File marker variables */
		vm.fileList = [];
		vm.markers = [];
		vm.currentMarker = null;
		vm.curFileSearchHov = L.circleMarker([0,0], {radius: 35});	/* For highlighting the marker when the cursor is over its file in the search results */

		/* Marker link variables */
		/* These are for the arrows between markers depicting dependencies */
		vm.linkList = [];
		vm.linksHidden = true;
		vm.currentLink = null;
		vm.arrows = [];
		vm.arrowHeads = [];
		vm.addingLink = false;

		/* Leaflet icon general marker settings for all new markers using LeafIcon */
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

		/* Marker icons */
		var defaultIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/marker-icon-2x.png'});
		var fileMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/File-Marker.png'});
		var textMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/Txt-Marker.png'});
		var wordMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/Word-Marker.png'});
		var pdfMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/PDF-Doc-Marker.png'});
		var imageMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/Image-Marker.png'});
		var videoMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/Video-Marker.png'});
		var audioMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/Audio-Marker.png'});

		/* User's position icon */
		var posIcon = new LeafIcon({
			iconUrl: 'assets/img/map/markers/position-marker.png', 	/* Sets the icon as a marker with a clear circle */
			iconSize: [50, 62],
			iconAnchor: [25, 62],
			shadowUrl: vm.currentUser.avatar,  	/* Sets the shadow as the users avater which appears in the empty circle - circle radius set using position icon class in CSS */
			shadowSize: [50, 50],
			shadowAnchor: [25, 62],
			className: 'position-icon'
		});

		activate();

		///////////////////////////

		/**
		* @ngdoc function
		* @name activate
		* @methodOf map.controller:mapCtrl
		* @description Runs when the page first loads and starts the loading overlay for the map and calls 
		* the {@link map.controller:mapCtrl#methods_initMap initMap} function.
		*/
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'map'});
			initMap();
		}

		/**
		* @ngdoc function
		* @name initMap
		* @methodOf map.controller:mapCtrl
		* @description Initialises the map setting up the initial settings such as default location, zoom level, map tiles
		* position marker, and sidebar. Next the functions to get the users location and the file markers and
		* marker links from the database are called.
		*/
		function initMap() {
			var mapOptions = {
				center: [-34.4054039, 150.87842999999998],	/* Default position is UOW */
				zoom: 4
			};

			vm.map = L.map('map', mapOptions);

			var maxZoom = 22;

			/* All the available map tiles */
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

			/* Might be worth putting this in the user settings, or at least a setting for the default map */
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

			vm.posMarker = L.marker([vm.lat, vm.lng], { icon: posIcon, zIndexOffset: -500 })
			.bindTooltip('<strong>Your Position</strong>');

			vm.sidebar = L.control.sidebar('sidebar').addTo(vm.map);

			geoLocateUser();	/* Gets the users position */
			getFileList();		/* Gets the files from the DB */
			getLinks();			/* Gets the marker links from the DB */
		}

		/**
		* @ngdoc function
		* @name geoLocateUser
		* @methodOf map.controller:mapCtrl
		* @description Geolocates the user. If locationfound, calls 
		* {@link map.controller:mapCtrl#methods_onLocationFound onLocationFound} 
		* to update the map with the user location. if locationerror, calls 
		* {@link map.controller:mapCtrl#methods_onLocationError onLocationError}
		*/
		function geoLocateUser() {
			vm.map.on('locationfound', onLocationFound);	/* If location found, call onLocationFound function */
			vm.map.on('locationerror', onLocationError);	/* If error, call onLocationError function */
			vm.map.locate({setView: true, maxZoom: 15});
		}

		/**
		* @ngdoc function
		* @name onLocationFound
		* @param {Object} response Location object
		* @methodOf map.controller:mapCtrl
		* @description Adds position marker to the map at the users location, adds a accuracy raduis,
		* and a binds a popup with with the radius distance.
		*/
		function onLocationFound(response) {
			var radius = response.accuracy / 2;
			var userPos = response.latlng;

			vm.posMarker.setLatLng(userPos);
			vm.posMarker.bindPopup("<p style='margin: 5px !important;padding-top:8px;'>You are within " + $filter('formatDistance')(radius) + " of this point</p>", { closeButton:false });
			vm.posMarker.addTo(vm.map);

			var posCicle = L.circle(userPos, {
				radius: radius,
				color: '#cb2529'
			});

			/* Adds/removes the circle from the marker when focused/unfocused */
			vm.posMarker.on("popupopen", function() { 
				posCicle.addTo(vm.map); 
				vm.map.fitBounds(posCicle.getBounds());
			});
			
			vm.posMarker.on("popupclose", function() { vm.map.removeLayer(posCicle); });
		}

		/**
		* @ngdoc function
		* @name onLocationError
		* @param {Object} error Error object
		* @methodOf map.controller:mapCtrl
		* @description Displays error message to the user
		*/
		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		/**
		* @ngdoc function
		* @name getFileList
		* @methodOf map.controller:mapCtrl
		* @description Uses the {@link services.service:filesService#methods_getFileList getFileList} 
		* function from {@link services.service:filesService filesService} to load the files from the database.
		* On success, calls {@link map.controller:mapCtrl#methods_addMapMarkers addMapMarkers} to add the files
		* to the map.
		*/
		function getFileList() {
			filesService.getFileList()
			.then(function(data) {
				vm.fileList = data;
				addMapMarkers();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'map'});	/* If error, stop animated loading overlay */
			});
		}

		/************************************************************************/
		/*************************** MARKER FUNCTIONS ***************************/
		/************************************************************************/

		/**
		* @ngdoc function
		* @name addMapMarkers
		* @methodOf map.controller:mapCtrl
		* @description Adds the files to the map, checking each file type and using the appropriate marker icon.
		* Compiles and binds each the popup window and adds relevant event calls for each marker.
		*/
		function addMapMarkers() {
			vm.markers = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 40});
			
			/* For each file returned from the DB, a marker with an info  */
			/* window is created. Each marker is then added to the  */
			/* markers cluster group to be displayed on the map */
			vm.fileList.forEach(function(file, index, fileListArray) {
				var lat = file.coords.coordinates[1];
				var lng = file.coords.coordinates[0];

				var marker;

				switch(file.type) {
					case 'file':
					marker = L.marker([lat, lng], { icon: fileMarkerIcon });
					break;
					case 'text':
					marker = L.marker([lat, lng], { icon: textMarkerIcon });
					break;
					case 'doc':
					marker = L.marker([lat, lng], { icon: wordMarkerIcon });
					break;
					case 'pdf':
					marker = L.marker([lat, lng], { icon: pdfMarkerIcon });
					break;
					case 'image':
					marker = L.marker([lat, lng], { icon: imageMarkerIcon });
					break;
					case 'video':
					marker = L.marker([lat, lng], { icon: videoMarkerIcon });
					break;
					case 'audio':
					marker = L.marker([lat, lng], { icon: audioMarkerIcon });
					break;
					default:
					marker = L.marker([lat, lng], { icon: defaultIcon });
				}

				/* HTML for the popup boxes displayed when the file marker is pressed */
				var popupString = '<div class="info-window"><div style="background-color:#4676fa;border-radius: 12px 12px 0 0 !important;text-align:center;">' +
				'<h3 style="color:#FFF;margin-left:8px;margin-right:5px;padding-bottom:5px;padding-top:5px;padding-right:18px;">' + file.name + '</h3></div><div style="margin-left: 15px;margin-right:15px;margin-top:5px;margin-bottom:15px;">' +
				'<p><strong>Created By:</strong> ' + file.createdBy + '<br />' +
				'<strong>Size:</strong> ' + $filter('formatFileSize')(file.size, 2) + '<br />' +	/* uses formatFileSize filter to format the file size */
				'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");	/* uses date filter to format the date */

				/* If the file has tags, add as a comma separated list, listing each tag */
				/* otherwise skip and exclude the tags label */
				if(file.tags.length != 0) { 
					popupString += '<br /><strong>Tags:</strong> ';
					/* lists each tag for current file */
					popupString += file.tags.join(", ") + '</p>';
				} else {
					popupString += '</p>';
				}

				popupString += '<div style="padding-bottom:10px;"></div><div style="text-align:center;"><a ng-click="vm.viewFile(file)" class="btn btn-success btn-xs" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(file)" class="btn btn-primary btn-xs" role="button">Details</a> ' +
				'<a ng-click="vm.selectDependent(precedent)" class="btn btn-info btn-xs" role="button">Add Dependent</a></div>' +
				'</div></div>';

				/* compiles the HTML so ng-click works */
				var compiledPopupString = $compile(angular.element(popupString));
				var newScope = $scope.$new();

				/* New scope variables for the compiled string above */
				newScope.file = {
					name: file.name,
					path: file.path,
					key: file.key, 
					textFileKey: file.textFileKey
				};
				newScope.precedent = {
					_id: file._id,
					lat: lat,
					lng: lng
				};

				marker.bindPopup(compiledPopupString(newScope)[0]);

				/* Only include tooltips if the browser is not running on a mobile device */
				/* so mobile devices do not display the tooltip when a pin is pressed. */
				if (L.Browser.mobile != true) {
					var toolTipString = '<strong>File Name:</strong> ' + file.name + '<br />' + 
					'<strong>Created By:</strong> ' + file.createdBy + '<br />' + 
					'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");

					marker.bindTooltip(toolTipString);
				}

				/* When a marker is clicked and the popup opens, the currentMaker variable is set */
				/* so the marker can be removed if the file is deleted. */
				/* Also hides the tooltip from the marker when the popup window is open */
				marker.on("popupopen", function() { 
					vm.currentMarker = this; 
					var toolTip = marker.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0);
					}
				});

				/* Sets the current marker to null and unhides the tooltip from the marker */
				/* when the popup window is closed */
				marker.on("popupclose", function() { 
					vm.currentMarker = null; 
					var toolTip = marker.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0.9);
					}	
				});

				vm.markers.addLayer(marker);
				fileListArray[index].marker = marker;	/* Adds the marker objects into the corresponding file object */
			});

			vm.map.addLayer(vm.markers);	/* Adds the markers cluster group to the map */
			bsLoadingOverlayService.stop({referenceId: 'map'});	/* Stop animated loading overlay */
		}

		/**
		* @ngdoc function
		* @name viewFile
		* @param {Object} file File object
		* @methodOf map.controller:mapCtrl
		* @description Opens a file in a new tab, using google docs viewer if it is a document, overwise,
		* opens in the browser if natively supported. If not supported, a download prompt should be displayed.
		*/
		function viewFile(file) {

			/* Open a blank new tab while still in a trusted context to prevent a popup blocker warning */
			var newTab = $window.open("about:blank", '_blank');

			/* CSS and HTML for loading animation to display while fetching the signed URL */
			var loaderHTML = '<style>#loader{position: absolute;left: 50%;top: 50%;border:0.5em solid rgba(70, 118, 250, 0.2);border-radius:50%;'+
			'border-top:0.5em solid #4676fa;width:75px;height:75px;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite;}'+
			'@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}'+
			'@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'+
			'<div id="loader"></div>';

			/* Write the loading animation code to the new window */
			newTab.document.write(loaderHTML);

			/* Make a request to the server for a signed URL to download/view the requested file */
			s3Service.signDownload(file.path, file.name)
			.then(function(data) {
				/* Remove the animation 1s after the signed URL is retrieved */
				setTimeout(function(){
					newTab.document.getElementById("loader").remove();
				},1000);

				/* Redirect the new tab to the signed URL */
				/* If the file is a document or text file, open in google docs viewer to view in the browser */
				if(data.type === "doc") {
					var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(data.url) + '&embedded=true';
					newTab.location = encodedUrl;
				} else {
					/* Else either download or view in browser (if natively compatible) */
					newTab.location = data.url;
				}

			}, function() {
				/* If there is an error, close the new tab */
				newTab.close();
			});
		}

		/**
		* @ngdoc function
		* @name popupFileDetails
		* @param {Object} file File object
		* @methodOf map.controller:mapCtrl
		* @description Opens a popup modal ({@link files.controller:fileDetailsCtrl fileDetailsCtrl}) 
		* to display the file details and some additional options such as make puplic/private and delete. 
		* Passes the file object.
		*/
		function popupFileDetails(file) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/files/fileDetails/fileDetails.view.html',
				controller: 'fileDetailsCtrl as vm',
				size: 'lg',
				resolve: {
					file: function () {
						return file;
					}
				}
			});
			modalInstance.result.then(function(result) {
				if(result.action === "delete") {
					vm.markers.removeLayer(vm.currentMarker);
				}
			}, function() {});
		}

		/**
		* @ngdoc function
		* @name removeAllMarkers
		* @methodOf map.controller:mapCtrl
		* @description Removes all the map markers from the map.
		*/
		function removeAllMarkers() {	
			vm.map.removeLayer(vm.markers);
			vm.markers = null;
		}

		/**
		* @ngdoc function
		* @name fileSearchHover
		* @param {String} event Cursor event ('enter' or 'exit')
		* @param {Object} file File object
		* @methodOf map.controller:mapCtrl
		* @description Places a circle around the marker if the cursor enters the file box 
		* in the search results side bar, removes circle when the cursor exits the file box.
		*/
		function fileSearchHover(event, file) {
			if(event === 'enter') {
				var lat = file.coords.coordinates[1];
				var lng = file.coords.coordinates[0];
				vm.curFileSearchHov.setLatLng([lat, lng]);
				vm.curFileSearchHov.addTo(vm.map);
			} else if (event === 'exit') {
				vm.curFileSearchHov.remove();
			}
		}

		/**
		* @ngdoc function
		* @name fileSearchClick
		* @param {Object} file File object
		* @methodOf map.controller:mapCtrl
		* @description Zooms to the marker, unspiderfying if necessary, and displays the markers 
		* popup box if a file in the search results side bar is clicked.
		*/
		function fileSearchClick(file) {
			vm.markers.zoomToShowLayer(file.marker, function(){	
				if(file.marker.isPopupOpen()) {
					file.marker.closePopup();
				} else {
					file.marker.openPopup();
					if (L.Browser.mobile) { /* If on a mobile device close the side bar so the popup is visible */
						vm.sidebar.close();
					}
				}
			});
		}

		/*****************************************************************************/
		/*************************** MARKER LINK FUNCTIONS ***************************/
		/*****************************************************************************/

		/**
		* @ngdoc function
		* @name getLinks
		* @methodOf map.controller:mapCtrl
		* @description Gets all the marker links from the database to be displayed on the map.
		* Uses the {@link services.service:mapService#method_getLinks mapService} function from 
		* {@link services.service:mapService mapService}.
		*/
		function getLinks() {
			mapService.getLinks()
			.then(function(data) {
				vm.linkList = data;
			});
		}

		/**
		* @ngdoc function
		* @name addLinks
		* @methodOf map.controller:mapCtrl
		* @description Adds all marker links to the map when the show dependencies button is pressed.
		* Also compiles and binds a popup and events to the markers.
		*/
		function addLinks() {
			vm.linksHidden = false;	/* Sets false so the show dependencies button displays hide dependencies */

			vm.linkList.forEach(function(link) {
				/* Creates the polyline for each link from the database */
				var arrow = L.polyline([[link.dependent.coords.coordinates[1], link.dependent.coords.coordinates[0]], [link.precedent.coords.coordinates[1], link.precedent.coords.coordinates[0]]], {
					color: '#4676fa',
					weight: 8
				}).addTo(vm.map);

				/* Creates the arrow head for each line */
				var arrowHead = L.polylineDecorator(arrow, {
					patterns: [{
						offset: '100%', 
						repeat: 0, 
						symbol: L.Symbol.arrowHead({
							pixelSize: 18, 
							polygon: false, 
							pathOptions: {
								stroke: true,
								weight: 5,
								color: '#4676fa'
							}
						})
					}]
				}).addTo(vm.map);

				/* HTML for the popup boxes displayed when the link is pressed */
				var popupString = '<div class="info-window"><div style="background-color:#4676fa;border-radius: 12px 12px 0 0 !important;text-align:center;">' +
				'<h3 style="color:#FFF;margin-left:5px;margin-right:5px;padding-bottom:5px;padding-top:5px;">' + link.name + '</h3></div><div style="margin-left: 15px;margin-right:15px;margin-top:5px;margin-bottom:15px;">' +
				'<p><strong>Description:</strong> ' + link.description + '<br />' +
				'<strong>Created By:</strong> ' + link._creator.firstName + '<br />' +
				'<strong>Date Created:</strong> ' + $filter('date')(link.dateCreated, "dd MMMM, yyyy h:mm a") + '</p><div style="padding-bottom:10px;"></div>' +	/* uses date filter to format the date */
				'<a ng-click="vm.confirmLinkDelete(link)" class="btn btn-danger btn-xs" role="button">Delete</a>' +
				'</div></div>';

				/* Compiles the HTML so ng-click works */
				var compiledPopupString = $compile(angular.element(popupString));
				var newScope = $scope.$new();

				/* New scope variables for the compiled string above */
				newScope.link = link;

				arrow.bindPopup(compiledPopupString(newScope)[0]);

				/* Only include tooltips if the browser is not running on a mobile device */
				/* so mobile devices do not display the tooltip when a link is pressed. */
				if (L.Browser.mobile != true) {
					var toolTipString = '<strong>Name:</strong> ' + link.name + '<br />';
					if(link.description.length < 75) {	/* If the description is more than 75 characters it is not added to the tooltip to prevent it being too wide */
						toolTipString += '<strong>Description:</strong> ' + link.description + '<br />';
					}
					toolTipString += '<strong>Date Created:</strong> ' + $filter('date')(link.dateCreated, "dd MMMM, yyyy h:mm a");

					arrow.bindTooltip(toolTipString, {sticky: true});
				}

				/* When a link is clicked and it is popup opens, the currentLink variable is set */
				/* so the link can be removed if it is deleted. */
				/* Also hides the tooltip from the link when the popup window is open */
				arrow.on("popupopen", function() { 
					vm.currentLink = {
						line: this,
						head: arrowHead
					}; 
					var toolTip = arrow.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0);
					}
				});

				/* Sets the current link to null and unhides the tooltip from the link */
				/* when the popup window is closed */
				arrow.on("popupclose", function() { 
					vm.currentLink = null; 
					var toolTip = arrow.getTooltip();
					if(toolTip) {
						toolTip.setOpacity(0.9);
					}	
				});

				/* Adds the arrows and arrowHeads to arrays */
				vm.arrows.push(arrow);
				vm.arrowHeads.push(arrowHead);
			});
		}

		/**
		* @ngdoc function
		* @name removeLinks
		* @methodOf map.controller:mapCtrl
		* @description Removes all the marker links from the map - not from the linkList array.
		*/
		function removeLinks() {	
			vm.linksHidden = true;
			vm.arrows.forEach(function(arrow) {
				vm.map.removeLayer(arrow);
			});
			vm.arrowHeads.forEach(function(arrowHead) {
				vm.map.removeLayer(arrowHead);
			});
		}

		/**
		* @ngdoc function
		* @name toggleLinks
		* @methodOf map.controller:mapCtrl
		* @description Shows/hides marker links.
		*/
		function toggleLinks() {
			if(vm.linksHidden) {
				addLinks();
			} else {
				removeLinks();
			}
		}

		/**
		* @ngdoc function
		* @name selectDependent
		* @param {Object} precedent Precedent marker object
		* @methodOf map.controller:mapCtrl
		* @description Removes all the markers from the map then re-adds them, excluding any that share
		* the same coordinates as the precedent marker and excluding the popup window.
		* Fired when the add dependent button is pressed
		*/
		function selectDependent(precedent) {
			vm.addingLink = true;

			removeAllMarkers();

			vm.markers = L.markerClusterGroup({showCoverageOnHover: false});

			/* For each file returned from the DB, a marker is added to the */ 
			/* markers cluster group to be displayed on the map */
			vm.fileList.forEach(function(file) {
				/* If the marker being added shares coordinates with the precedent marker, skip */
				if(file.coords.coordinates[1] != precedent.lat && file.coords.coordinates[0] != precedent.lng) {
					var lat = file.coords.coordinates[1];
					var lng = file.coords.coordinates[0];
					var marker;

					switch(file.type) {
						case 'file':
						marker = L.marker([lat, lng], { icon: fileMarkerIcon });
						break;
						case 'text':
						marker = L.marker([lat, lng], { icon: textMarkerIcon });
						break;
						case 'doc':
						marker = L.marker([lat, lng], { icon: wordMarkerIcon });
						break;
						case 'pdf':
						marker = L.marker([lat, lng], { icon: pdfMarkerIcon });
						break;
						case 'image':
						marker = L.marker([lat, lng], { icon: imageMarkerIcon });
						break;
						case 'video':
						marker = L.marker([lat, lng], { icon: videoMarkerIcon });
						break;
						case 'audio':
						marker = L.marker([lat, lng], { icon: audioMarkerIcon });
						break;
						default:
						marker = L.marker([lat, lng], { icon: defaultIcon });
					}

					/* Tooltip string containing basic file info */
					var toolTipString = '<strong>File Name:</strong> ' + file.name + '<br />' + 
					'<strong>Created By:</strong> ' + file.createdBy + '<br />' + 
					'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");

					marker.bindTooltip(toolTipString);

					/* When a marker is clicked its ids are passed to the popup modal */
					/* where information about the link is entered */
					marker.on("click", function() { 
						vm.addingLink = false; /* To remove the cancel window */
						popupLinkInfo({ precedent:precedent._id, dependent:file._id});	/* Passes the precedent and dependent marker ids to the Link info popup modal */
					});

					vm.markers.addLayer(marker);
				}
			});

			/* Adds the markers cluster group to the map */
			vm.map.addLayer(vm.markers);
		}

		/**
		* @ngdoc function
		* @name cancelAddingLink
		* @methodOf map.controller:mapCtrl
		* @description Cancels adding a dependent link.
		* If the user presses cancel when selecting a dependent marker the cancel window is
		* hidden and the markers displayed on the map are refreshed.
		*/
		function cancelAddingLink() {
			vm.addingLink = false;
			removeAllMarkers();
			addMapMarkers();
		}

		/**
		* @ngdoc function
		* @name popupLinkInfo
		* @param {Object} markers Precedent and dependent ObjectId (Files ObjectId)
		* @methodOf map.controller:mapCtrl
		* @description Opens the link Info modal for entering link information.
		*/
		function popupLinkInfo(markers) {
			var modalInstance = $uibModal.open({
				templateUrl: '/components/map/linkInfo/linkInfo.view.html',
				controller: 'linkInfoCtrl as vm',
				size: 'lg',
				resolve: {
					markers: function () {	/* Passes the markers to the modal */
						return markers;
					}
				}
			});

			/* If the link information is successfully saved to the db the new document is */
			/* added to the linkList array and the links and markers displayed on the map are */
			/* refreshed. If the modal is canceled, the map markers displayed are refreshed */
			modalInstance.result.then(function(results) {
				vm.linkList.push(results);
				if(!vm.linksHidden) {	/* Only refresh the links displayed if links are currently shown */
					removeLinks();
					addLinks();
				}
				removeAllMarkers();
				addMapMarkers();
			}, function () {
				removeAllMarkers();
				addMapMarkers();
			});
		};

		/**
		* @ngdoc function
		* @name confirmLinkDelete
		* @param {Object} link Link object
		* @methodOf map.controller:mapCtrl
		* @description Displays a popup alert for the user to confirm the marker link deletion.
		*/
		function confirmLinkDelete(link) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the link '" + link.name + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteLink(link);	/* If confirmed */
			});
		}

		/**
		* @ngdoc function
		* @name deleteLink
		* @param {Object} link Link object
		* @methodOf map.controller:mapCtrl
		* @description Deletes the marker link from the database.
		* Uses the {@link services.service:mapService#method_deleteLink mapService} function from 
		* {@link services.service:mapService mapService}.
		*/
		function deleteLink(link) {
			mapService.deleteLink(link._id)
			.then(function() {
				removeCurrentLink(link);
				logger.success("'" + link.name + "' was deleted successfully", "", "Success");
			});
		}

		/**
		* @ngdoc function
		* @name removeCurrentLink
		* @param {Object} link Link object
		* @methodOf map.controller:mapCtrl
		* @description Removes the deleted marker link from the map.
		*/
		function removeCurrentLink(link) {	
			var leafletLink = vm.currentLink;
			vm.map.removeLayer(leafletLink.line);
			vm.map.removeLayer(leafletLink.head);
			removeLink(link);
		}

		/**
		* @ngdoc function
		* @name removeLink
		* @param {Object} link Link object
		* @methodOf map.controller:mapCtrl
		* @description Removes the deleted link from the local linkList array.
		*/
		function removeLink(link) {	
			/* Find the links index for the link id in the linkList array, will return -1 if not found  */
			var linkIndex = vm.linkList.findIndex(function(obj){return obj._id == link._id});

			/* Remove the link from the linkList array */
			if (linkIndex > -1) {
				vm.linkList.splice(linkIndex, 1);
			}
		}
	}

})();