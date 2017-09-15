(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('mapCtrl', mapCtrl);

	/* @ngInject */
	function mapCtrl(filesService, $scope, $filter, $compile, $window, $uibModal, logger, bsLoadingOverlayService, mapService, s3Service, authentication) {
		var vm = this;

		/* Bindable Functions */
		/* File marker functions */
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;
		vm.confirmFileDelete = confirmFileDelete;
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
		vm.currentUser = authentication.currentUser();

		/* File marker variables */
		vm.fileList = null;
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

		/* To move - may move the majority of the mapping functions into it's own directive */
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

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'map'});
			initMap();
		}

		/* Initialises the map setting up the initial settings such as default location, zoom level, map tiles */
		/* position marker, and sidebar. Next the functions to get the users location and the file markers and */
		/* marker links from the database are called */
		function initMap() {
			var mapOptions = {
				center: [-34.4054039, 150.87842999999998],	/* Default position is UOW */
				zoom: 4
			};

			vm.map = L.map('map', mapOptions);

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

		/* If getPosition returns successfully, update the user's posistion on the map */
		function geoLocateUser(position) {
			vm.map.on('locationfound', onLocationFound);	/* If location found, call onLocationFound function */
			vm.map.on('locationerror', onLocationError);	/* If error, call onLocationError function */
			vm.map.locate({setView: true, maxZoom: 15});
		}

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

		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		/************************************************************************/
		/*************************** MARKER FUNCTIONS ***************************/
		/************************************************************************/

		/* Gets all the files from the database to be displayed on the map */
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				vm.fileList = response.data;
				addMapMarkers();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'map'});	/* If error, stop animated loading overlay */
			});
		}

		/* Adds markers to the map for the files retrieved from the database */
		function addMapMarkers() {
			vm.markers = L.markerClusterGroup({showCoverageOnHover: false});
			
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
				'<h3 style="color:#FFF;margin-left:5px;margin-right:5px;padding-bottom:5px;padding-top:5px;">' + file.name + '</h3></div><div style="margin-left: 15px;margin-right:15px;margin-top:5px;margin-bottom:15px;"' +
				'<p><strong>Created By:</strong> ' + file.createdBy + '<br />' +
				'<strong>Size:</strong> ' + $filter('formatFileSize')(file.size, 2) + '<br />' +	/* uses formatFileSize filter to format the file size */
				'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a");	/* uses date filter to format the date */

				/* If the file has tags, add as a comma separated list, listing each tag */
				/* otherwise skip and exclude the 'tags' label */
				if(file.tags.length != 0) { 
					popupString += '<br /><strong>Tags:</strong> ';
					/* lists each tag for current file */
					popupString += file.tags.join(", ") + '</p>';
				} else {
					popupString += '</p>';
				}

				popupString += '<div style="padding-bottom:10px;"></div><div style="text-align:center;"><a ng-click="vm.viewFile(file)" class="btn btn-success btn-xs" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(file)" class="btn btn-primary btn-xs" role="button">Details</a> ' +
				/*'<a ng-click="vm.confirmFileDelete(file)" class="btn btn-danger btn-xs" role="button">Delete</a> ' + */
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

				/* When a marker is clicked and it's popup opens, the currentMaker variable is set */
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


		/* Get a signed URL to download the requested file from S3 */
		/* and if successful, open the signed URL in a new tab */
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
			.then(function(response) {
				/* Remove the animation 1s after the signed URL is retrieved */
				setTimeout(function(){
					newTab.document.getElementById("loader").remove();
				},1000);

				/* Redirect the new tab to the signed URL */
				/* If the file is a document or text file, open in google docs viewer to view in the browser */
				if(response.data.type === "doc") {
					var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(response.data.url) + '&embedded=true';
					newTab.location = encodedUrl;
				} else {
					/* Else either download or view in browser (if natively compatible) */
					newTab.location = response.data.url;
				}

			}, function() {
				/* If there is an error, close the new tab */
				newTab.close();
			});
		}

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

			modalInstance.result.then(function(results) {}, function() {});
		}

		function confirmFileDelete(file) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the file '" + file.name + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteFileDB(file);
			});
		}

		function deleteFileDB(file) {
			filesService.deleteFileDB(file.path, file.name)
			.then(function(response) {
				deleteFileS3(file);
			});
		}

		function deleteFileS3(file) {
			s3Service.deleteFile(file.key)
			.then(function(response) {
				/* If a text file was generated for analysis, delete that file too. */
				/* If the original file was a text file, just delete the original file */
				if(file.textFileKey && file.textFileKey != file.key){
					s3Service.deleteFile(file.textFileKey);
				}
				vm.markers.removeLayer(vm.currentMarker);
				logger.success("'" + file.name + "' was deleted successfully", "", "Success");
			});
		}

		function removeAllMarkers() {	
			vm.map.removeLayer(vm.markers);
			vm.markers = null;
		}

		/* If the cursor enters the file box in the search results side bar this function  */
		/* places a circle around the marker until the cursor leaves the file box */
		function fileSearchHover(event, file) {
			if(event === 'enter') {
				var lat = file.coords.coordinates[1];
				var lng = file.coords.coordinates[0];
				vm.curFileSearchHov.setLatLng([lat, lng]);
				vm.curFileSearchHov.addTo(vm.map);
			} else if (event === 'leave') {
				vm.curFileSearchHov.remove();
			}
		}

		/* If a file in the search results side bar is clicked this function zooms to  */
		/* the marker, unspiderfying if necessary, and displays the markers popup box */
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

		/* Gets all the marker links from the database to be displayed on the map */
		function getLinks() {
			mapService.getLinks()
			.then(function(response) {
				vm.linkList = response.data;
			});
		}

		/* Adds all marker links to the map when the show dependencies button is pressed */
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
				var popupString = '<div class="info-window">' +
				'<h3>' + link.name + '</h3>' +
				'<p><strong>Description:</strong> ' + link.description + '<br />' +
				'<strong>Created By:</strong> ' + link._creator.firstName + '<br />' +
				'<strong>Date Created:</strong> ' + $filter('date')(link.dateCreated, "dd MMMM, yyyy h:mm a") + '</p>' +	/* uses date filter to format the date */
				'<a ng-click="vm.confirmLinkDelete(linkID, linkName)" class="btn btn-danger" role="button">Delete</a>' +
				'</div>';

				/* Compiles the HTML so ng-click works */
				var compiledPopupString = $compile(angular.element(popupString));
				var newScope = $scope.$new();

				/* New scope variables for the compiled string above */
				newScope.linkID = link._id;
				newScope.linkName = link.name;

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

				/* When a link is clicked and it's popup opens, the currentLink variable is set */
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

		/* Removes all the marker links from the map - not from the linkList array */
		function removeLinks() {	
			vm.linksHidden = true;
			vm.arrows.forEach(function(arrow) {
				vm.map.removeLayer(arrow);
			});
			vm.arrowHeads.forEach(function(arrowHead) {
				vm.map.removeLayer(arrowHead);
			});
		}

		/* show/hide marker links */
		function toggleLinks() {
			if(vm.linksHidden) {
				addLinks();
			} else {
				removeLinks();
			}
		}

		/* Fired when the add dependent button is pressed */
		/* Removes all the markers from the map then re-adds them, excluding any that share */
		/* the same coordinates as the precedent marker and excluding the popup window */
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
					var marker = L.marker([lat, lng], { icon: defaultIcon });

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

		/* If the user presses cancel when selecting a dependent marker the cancel window is */
		/* hidden and the markers displayed on the map are refreshed */ 
		function cancelAddingLink() {
			vm.addingLink = false;
			removeAllMarkers();
			addMapMarkers();
		}

		/* Opens the link Info modal for entering link information */
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

		/* Alert message displayed to confirm deleting marker link */
		function confirmLinkDelete(linkID, linkName) {
			swal({
				title: "Are you sure?",
				text: "Confirm to delete the link '" + linkName + "'",
				type: "warning",
				showCancelButton: true,
				allowOutsideClick: true,
				confirmButtonColor: "#d9534f",
				confirmButtonText: "Yes, delete it!"
			}, function() {
				deleteLink(linkID, linkName);	/* If confirmed */
			});
		}

		/* Deletes the marker link from the database */
		function deleteLink(linkID, linkName) {
			mapService.deleteLink(linkID)
			.then(function() {
				removeCurrentLink(linkID);
				logger.success("'" + linkName + "' was deleted successfully", "", "Success");
			});
		}

		/* Removes the deleted marker link from the map */
		function removeCurrentLink(linkID) {	
			var link = vm.currentLink;
			vm.map.removeLayer(link.line);
			vm.map.removeLayer(link.head);
			removeLink(linkID);
		}

		/* Removes the deleted link from the local linkList array */
		function removeLink(linkID) {	
			/* Find the links index for the link id in the linkList array, will return -1 if not found  */
			var linkIndex = vm.linkList.findIndex(function(obj){return obj._id == linkID});

			/* Remove the link from the linkList array */
			if (linkIndex > -1) {
				vm.linkList.splice(linkIndex, 1);
			}
		}
	}

})();