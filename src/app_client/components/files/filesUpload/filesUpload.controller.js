(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesUploadCtrl', filesUploadCtrl);
	

	/* @ngInject */
	function filesUploadCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile, bsLoadingOverlayService) {
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
		vm.posMarkerMoved = false;	// After moving the marker, the accuracy circle will be removed, i.e. the posMarkerMoved bool will be true
		vm.fileList = null;
		vm.lat = -34.4054039;	// Default position is UOW
		vm.lng = 150.87842999999998;
		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';
		vm.currentPercentage = '0';
		vm.file = null;
		vm.fileInfo = {};
		vm.textFile = {};
		vm.textFileInfo = {};
		vm.pageHeader = {
			title: 'Upload Files'
		};
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.uploadButtonOptions = { buttonDefaultText: 'Upload', animationCompleteTime: 1000, buttonSubmittingText: 'Uploading...', buttonSuccessText: 'Done!' };
		vm.isProcessing = false;

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
			bsLoadingOverlayService.start({referenceId: 'upload-map'});	// Start animated loading overlay
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
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'upload-map'});	// If error, stop animated loading overlay
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
			bsLoadingOverlayService.stop({referenceId: 'upload-map'});	// Stop animated loading overlay
		}

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			if (uploadFiles.length > 0 ) {
				if(uploadFiles[0].size < 10485760) {	// Checks if file's size is less than 10 MB
					vm.file = uploadFiles[0];
				vm.fileInfo = {
					name: vm.file.name,
					type: vm.file.type
				};
				// If uploading a text/plain file, change the type to include charset=utf-8 so special characters are encoded properly
				if (vm.fileInfo.type === "text/plain"){
					vm.fileInfo.type = "text/plain; charset=utf-8";
				}
			} else {
					logger.error("Maximum file size is 10 MB. \nPlease select a smaller file.", "", "Error");	// If larger, display message and reinitialise the file variables
					cleanUpForNextUpload();
				}
			}
		}

		function uploadFile() {
			if(vm.file) {
				processingEvent(true, null);	// ng-bs-animated-button status & result
				var fileExtension = (vm.fileInfo.name.split('.').pop()).toLowerCase();
				switch (fileExtension) {
					case 'pdf':
						vm.fileInfo.icon = "fa fa-file-pdf-o";	// PDF icon type
						convertPDFToText()
						break;
					case 'docx':
						vm.fileInfo.icon = "fa fa-file-word-o";	// Word icon type
						convertDocxToText();
						break;
					case 'doc':
						vm.fileInfo.icon = "fa fa-file-word-o";	// Word icon type
						uploadActualFile();
						break;
					case 'txt':
						vm.fileInfo.icon = "fa fa-file-text-o";	// Text icon type
						vm.fileInfo.isTxtFile = true;
						uploadActualFile();
						break;
					case 'gif':
					case 'jpg':
					case 'jpeg':
					case 'png':
					case 'bmp':
					case 'tif':
						vm.fileInfo.icon = "fa fa-file-image-o";	// Image icon type
						uploadActualFile();
						break;
					default: 
						vm.fileInfo.icon = "fa fa-file-o";	// Generic File icon type
						uploadActualFile();
				}
			} else {
				logger.error("Please select a file to upload.", "", "Error");
			}
		}

		function convertPDFToText() {
			var fileReader = new FileReader();
			fileReader.onload = function() { 
				var arrayBuffer = this.result;	

				getPDFText(arrayBuffer).then(function (text) {
					createTextFile(text);
				}, function (error) {
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
					$scope.$apply();	// To reflect the changes in the processingEvent (upload button animation) on the view
					logger.error(error.message, error, 'Error');
					cleanUpForNextUpload();
				});
			}
			fileReader.readAsArrayBuffer(vm.file);

			function getPDFText(pdfFile){
				var pdf = PDFJS.getDocument({data: pdfFile});
				return pdf.then(function(pdf) {
					var maxPages = pdf.pdfInfo.numPages;
					var countPromises = [];
					for (var j = 1; j <= maxPages; j++) {
						var page = pdf.getPage(j);

						var txt = "";
						countPromises.push(page.then(function(page) {
							var textContent = page.getTextContent();
							return textContent.then(function(text){
								return text.items.map(function (s) { return s.str; }).join('');
							});
						}));
					}

					return Promise.all(countPromises).then(function (texts) {
						return texts.join('');
					});
				});
			}
		}

		// Testing DocxJS for converting docx files to text... looks good
		function convertDocxToText() {
			var docxJS = new DocxJS();
			docxJS.parse(
				vm.file,
				function () {
					docxJS.getPlainText(function(text){
						createTextFile(text);
					});
				}, function (error) {
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
					logger.error(error.msg, error, 'Error');
					cleanUpForNextUpload();
				});
		}

		function createTextFile(text) {
			// Replaces the file name extension with .txt
			var textFileName = vm.fileInfo.name.replace(/\.[^/.]+$/, "")
			textFileName += ".txt";
			vm.textFile = new File([text], textFileName, {type: "text/plain; charset=utf-8"});
			vm.textFileInfo = {
				name: vm.textFile.name,
				type: vm.textFile.type
			};
			uploadTextFile();
		}

		function uploadTextFile() {
			filesService.signUploadS3(vm.textFileInfo)
			.then(function(result) {
				Upload.upload({
					method: 'POST',
					url: result.data.url, 
					fields: result.data.fields, 
					file: vm.textFile
				})
				.then(function(response) {
					console.log(vm.textFileInfo.name + ' successfully uploaded to S3');
					vm.textFileInfo.key = result.data.fields.key;
					// Use the same key but with the original file extension (e.g. use .pdf not .txt)
					vm.fileInfo.key = vm.textFileInfo.key.substring(0, vm.textFileInfo.key.indexOf('-'));
					vm.fileInfo.key += "-" + vm.fileInfo.name;
					uploadActualFile();
				}, function(error) {
					var xml = $.parseXML(error.data);
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
					logger.error($(xml).find("Message").text(), '', 'Error');
					cleanUpForNextUpload();
				});
			}, function(err) {
				processingEvent(false, 'error');	// ng-bs-animated-button status & result
			});
		}

		function uploadActualFile() {
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
					console.log(vm.fileInfo.name + ' successfully uploaded to S3');
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
						size : vm.file.size,
						url : url,
						createdBy : authentication.currentUser().firstName,
						coords : { 
							lat : vm.lat,
							lng : vm.lng
						},
						tags : tagStrings,
						icon : vm.fileInfo.icon
					}
					if(vm.textFileInfo.key) {
						fileDetails.textFileKey = vm.textFileInfo.key;
					}
					if(vm.fileInfo.isTxtFile){
						fileDetails.textFileKey = key;
					}
					filesService.addFileDB(fileDetails)
					.then(function(response) {
						processingEvent(false, 'success');	// ng-bs-animated-button status & result
						vm.fileList.push(response.data);
						console.log(vm.fileInfo.name + ' successfully added to DB');
						logger.success(vm.fileInfo.name + ' successfully uploaded', '', 'Success');
						updateMapMarkers();
						cleanUpForNextUpload();
					});
				}, function(error) {
					processingEvent(false, 'error');	// ng-bs-animated-button status & result
					var xml = $.parseXML(error.data);
					logger.error($(xml).find("Message").text(), '', 'Error');
					cleanUpForNextUpload();
				});
			}, function(err) {
				processingEvent(false, 'error');	// ng-bs-animated-button status & result
			});
		}

		function updateMapMarkers() {
			vm.markers.clearLayers()
			addMapMarkers();
		}

		function cleanUpForNextUpload() {
			vm.file = null;
			vm.fileInfo = {};
			vm.textFile = {};
			vm.textFileInfo = {};
			document.getElementById("file-upload-input").value = "";
		}

		// For the animated submit button and other elements that should be disabled during event processing
		function processingEvent(status, result) {
			vm.isSubmittingButton = status;	// ng-bs-animated-button status
			vm.resultButton = result;	// ng-bs-animated-button result (error/success)

			vm.isProcessing = status;	// Processing flag for other view elements to check
		}
	}

})();