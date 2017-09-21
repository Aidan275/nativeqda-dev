(function () { 

	'use strict';

	angular
	.module('files')
	.controller('filesUploadCtrl', filesUploadCtrl);
	
	/* @ngInject */
	function filesUploadCtrl(currentPath, $scope, $uibModalInstance, Upload, filesService, authService, logger, $filter, s3Service) {
		var vm = this;

		vm.currentModalPage = 1;	/* Outside the rendered event to prevent the modal content from suddenly appearing once the modal is ready */

		/* Is resolved when the modal gets opened after downloading content's template and resolving all variables  */
		/* For problem with map being added to the DOM before it was ready */
		$uibModalInstance.rendered.then(function(){

			/* Temporary fix */
			if(currentPath === ''){
				currentPath = '/';
			}

			/* Bindable Functions */
			vm.onFileSelect = onFileSelect;
			vm.uploadFile = uploadFile;
			vm.changeModalPage = changeModalPage;

			/* Bindable Data */
			vm.currentPath = currentPath;
			vm.map = null;
			vm.marker = null;
			vm.markers = {};
			vm.posMarker = null;
			vm.posMarkerMoved = false;	/* After moving the marker, the accuracy circle will be removed, i.e. posMarkerMoved = true */
			vm.lat = -34.4054039;	/* Default position is UOW */
			vm.lng = 150.87842999999998;
			vm.currentUser = authService.currentUser();
			vm.tags = [];
			vm.fileList = [];
			vm.currentPercentage = '0';
			vm.file = null;
			vm.fileInfo = {};
			vm.textFile = null;
			vm.textFileInfo = {};
			vm.isSubmittingButton = null;	/* variables for button animation - ng-bs-animated-button */
			vm.resultButton = null;
			vm.uploadButtonOptions = { buttonDefaultText: 'Upload', animationCompleteTime: 1000, buttonSubmittingText: 'Uploading...', buttonSuccessText: 'Done!' };
			vm.isProcessing = false;

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
			var uploadMarkerIcon = new LeafIcon({iconUrl: 'assets/img/map/markers/upload-marker.png'});

			var uploadMarkerIcon = new LeafIcon({
				iconUrl: 'assets/img/map/markers/upload-marker.png',
				iconSize: [50, 62],
				shadowSize: [80, 80],
				iconAnchor: [25, 62],
				shadowAnchor: [25, 80]
			});

			activate();		

			///////////////////////////

			function activate() {
				initMap();
			}

			function initMap() {
				var mapOptions = {
					center: [-34.4054039, 150.87842999999998],	/* Default position is UOW */
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

				/* Create new marker for the file upload position - default position */
				vm.posMarker = L.marker([vm.lat, vm.lng], { icon: uploadMarkerIcon, draggable: true, zIndexOffset: 1000 })
				.addTo(vm.map)
				.bindTooltip('<strong>File Upload Position</strong>')
				.bindPopup(	"<p>Drag me to change the file upload position</p>");

				/* Event for when the file position marker is dragger */
				vm.posMarker.on('drag', function(event) {
					updatePosMarker(event);
				});

				/* Event for when map is clicked, moves the file position marker to the location clicked */
				vm.map.on('click', function(event) {
					vm.posMarker.setLatLng(event.latlng);
					updatePosMarker(event);
				});

				geoLocateUser();	/* Find the position of the user */
				getFileList();	/* Gets all the files from the database for the map*/
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

			/* If getPosition returns successfully, update the user's posistion on the map */
			function geoLocateUser(position) {
				vm.map.on('locationfound', onLocationFound);
				vm.map.on('locationerror', onLocationError);
				vm.map.locate({setView: true, maxZoom: 15});
			}

			function onLocationFound(response) {
				/* If the user's location is found, the position of the file marker is updated */
				var userPos = response.latlng;
				var radius = response.accuracy / 2;

				vm.lat = userPos.lat;
				vm.lng = userPos.lng;

				/* Move the marker and update the popup content of the marker  */
				vm.posMarker.setLatLng(userPos);
				vm.posMarker.setPopupContent("	<p>You are within " + $filter('formatDistance')(radius) + " from this point<br />" +
					"Drag me to change the file upload position</p>");

				/* Create a circle to represent the accuracy radius */
				var posCicle = L.circle(userPos, {
					radius: radius,
					color: '#cb2529'
				});

				/* Adds/removes the accuracy circle from the marker when focused/unfocused (only if the marker hasn't been moved). */
				vm.posMarker.on("popupopen", function() {
					if(!vm.posMarkerMoved) { 
						posCicle.addTo(vm.map); 
						vm.map.fitBounds(posCicle.getBounds());
					}
				});

				vm.posMarker.on("popupclose", function() { 
					if(!vm.posMarkerMoved) {
						vm.map.removeLayer(posCicle); 
					}
				});
			}

			function onLocationError(error) {
				logger.error(error.message, error, 'Error');
			}

			/* Gets all the files from the database to be displayed on the map */
			function getFileList() {
				filesService.getFileList()
				.then(function(data) {
					vm.fileList = data;
					addMapMarkers();
				});
			}

			/* Adds markers for the files retrieved from the database */
			function addMapMarkers() {
				vm.markers = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 40});

				/* For each file, a marker is added to the marker Cluster Group to be displayed on the map. */
				/* If the marker is clicked, it sets the upload marker to the file's location. */
				vm.fileList.forEach(function(file) {
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

					marker.bindTooltip(	'<strong>File Name:</strong> ' + file.name + '<br />' + 
						'<strong>Created By:</strong> ' + file.createdBy + '<br />' + 
						'<strong>Last Modified:</strong> ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a"));
					/* When a marker is clicked, the posMarker is moved to it */
					marker.on("click ", function() { 
						vm.posMarker.setLatLng([lat, lng]);
						updatePosMarker( { latlng: { lat: lat, lng: lng } } );
					});

					vm.markers.addLayer(marker);
				});
				vm.map.addLayer(vm.markers);
			}

			/* Triggered when a file is selected */
			function onFileSelect(uploadFiles) {
				if (uploadFiles.length > 0 ) {
					/* Checks if file's size is less than 10 MB */
					if(uploadFiles[0].size < 10485760) {
						vm.file = uploadFiles[0];	/* Selects first file only if multiple files are dragged into the drop zone */
						vm.fileInfo = {	/* Info used for generating the S3 signed upload URL */
							name: vm.file.name.replace(/\.[^/.]+$/, ""),	/* Extracts everything before the file extension */
							extension: (vm.file.name.split('.').pop()).toLowerCase(),	/* Extracts the file extension */
							type: vm.file.type,
							group: 'file'	/* Root folder the file is stored in on S3 - limited number of choices, check back-end */ 
						};
						
						if (vm.fileInfo.type === "text/plain"){	/* If uploading a text/plain file, change the type to include charset=utf-8 so special characters are encoded properly */
							vm.fileInfo.type = "text/plain; charset=utf-8";
						}

						processFile();	/* Process file and if pdf or docx file, extract text */

						/* Go to the next modal screen (Map for selecting location) */
						vm.currentModalPage = 2;
						setTimeout(function() {
							vm.map.invalidateSize();	/* Reinitialise the map container so it fits correctly */
							vm.map.setView(vm.posMarker.getLatLng(), 15);
						}, 100);
					} else {
						logger.error("Maximum file size is 10 MB. \nPlease select a smaller file.", "", "Error");	/* If larger than 10 MB, display message and reinitialise the file variables */
						vm.file = null;	/* Reinitialise file, file info, and the file input */
						vm.fileInfo = {};
						document.getElementById("file-input").value = "";
					}
				}
			}

			function processFile() {
				if(vm.file) {
					switch (vm.fileInfo.extension) {
						case 'pdf':
						vm.fileInfo.typeDB = "pdf";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-pdf-o";	/* PDF font awesome icon */
						convertPDFToText()	/* Extract text in the background before user presses upload */
						break;
						case 'docx':
						vm.fileInfo.typeDB = "doc";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-word-o";	/* Word font awesome icon */	
						convertDocxToText();	/* Extract text in the background before user presses upload */
						break;
						case 'doc':
						vm.fileInfo.typeDB = "doc";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-word-o";	/* Word font awesome icon */
						break;
						case 'txt':
						vm.fileInfo.typeDB = "text";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-text-o";	/* Text font awesome icon */
						vm.fileInfo.isTxtFile = true;
						break;
						case 'gif':
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'bmp':
						case 'tif':
						vm.fileInfo.typeDB = "image";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-image-o";	/* Image font awesome icon */
						break;
						case 'mkv':
						case 'mp4':
						case 'avi':
						case 'mov':
						case 'movie':
						case 'mpe':
						case 'mpeg':
						case 'mpg':
						case 'dvi':
						vm.fileInfo.typeDB = "video";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-video-o";	/* Image font awesome icon */
						break;
						case 'mp3':
						case 'm4a':
						case 'mpa':
						vm.fileInfo.typeDB = "audio";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-audio-o";	/* Image font awesome icon */
						break;
						default: 
						vm.fileInfo.typeDB = "file";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-o";	/* Generic File font awesome icon */
					}
				} else {
					logger.error("Please select a file to upload.", "", "Error");
				}
			}

			/* Using the PDFJS library for extracting the text from a PDF file */
			function convertPDFToText() {
				vm.isProcessing = true;	/* In case the text is still being extracted when the user is ready to upload (shows a disables processing button instead) */
				var fileReader = new FileReader();

				fileReader.onload = function() { 	/* Once PDF file loaded */
					var arrayBuffer = this.result;	

					getPDFText(arrayBuffer).then(function (text) {
						createTextFile(text);	/* If text extracted successfully, create text file */
					}, function (error) {
						logger.error(error.message, error, 'Error');	/* If error extracting the text display error message */
						vm.modal.close();								/* and close the modal */
					});	
				}

				fileReader.readAsArrayBuffer(vm.file);	/* Initialise reading the PDF file */

				/* Function for extracting the text */
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

			/* Using the docxJS library for extracting the text from a docx file (does not work with .doc files) */
			function convertDocxToText() {
				vm.isProcessing = true;	/* In case the text is still being extracted when the user is ready to upload (shows a disables processing button instead) */
				var docxJS = new DocxJS();

				docxJS.parse(vm.file, function() {
					docxJS.getPlainText(function(text){
						createTextFile(text);	/* If text extracted successfully, create text file */
					});
				}, function (error) {
					logger.error(error.msg, error, 'Error');	/* If error extracting the text display error message */
					vm.modal.close();							/* and close the modal */
				});
			}

			/* Creates text file using the extracted text */
			function createTextFile(text) {
				vm.textFile = new File([text], vm.fileInfo.name, {type: "text/plain; charset=utf-8"});

				vm.textFileInfo = {	/* Info used for generating the S3 signed upload URL */
					extension: "txt",
					type: vm.textFile.type,
					group: 'text-data'	/* Root folder the file is stored in on S3 - limited number of choices, check back-end */ 
				};

				vm.isProcessing = false;	/* Files ready to be uploaded - show upload button. Note: extracting text typically takes less than 1s*/
				$scope.$apply();			/* Asynchronous process therefor must use $scope.$apply() to update the view */
			}

			function uploadFile() {
				if(vm.fileInfo.name){	/* File must be named before uploading */
					processingEvent(true, null);	/* Shows 'Uploading...' button while uploading */
					if(vm.textFile) {		/* If pdf/docx file */
						uploadTextFile();	/* Upload the extracted text file first */
					} else {
						uploadActualFile();	/* Otherwise just upload the original file */
					}
				} else {
					logger.error('Please enter a file name' ,'', 'Error');
				}
			}

			function uploadTextFile() {
				s3Service.signUpload(vm.textFileInfo)	/* Get S3 signed upload URL */
				.then(function(data) {
					Upload.upload({	/* Upload the file using the signed URL */
						method: 'POST',
						url: data.url,
						fields: data.fields,
						file: vm.textFile 	/* Text file extracted from pdf/docx document */
					})
					.then(function(response) {	/* If successful */
						/* use the same key but with the original file extension (e.g. use 2017/08/13/93a75b7c5effdf945b6a.pdf not 2017/08/13/93a75b7c5effdf945b6a.txt) */
						vm.fileInfo.key = data.baseKey + '.' + vm.fileInfo.extension;
						vm.textFileInfo.key = data.fields.key; /* Saves the text data file key to be saved in the DB */
						uploadActualFile();	/* Upload the original file */
					}, function(error) {	/* If error */
						var xml = $.parseXML(error.data);	/* Parse error text to XML */ 
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
						logger.error($(xml).find("Message").text(), '', 'Error');	/* Find and log the error message */
						vm.modal.close();	/* Close the modal */
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					vm.modal.close();	/* Close the modal */
				});
			}

			/* Upload the original file */
			function uploadActualFile() {
				s3Service.signUpload(vm.fileInfo)	/* Get S3 signed upload URL */
				.then(function(data) {
					Upload.upload({	/* Upload the file using the signed URL */
						method: 'POST',
						url: data.url, 
						fields: data.fields, 
						file: vm.file	/* Original file */
					})
					.progress(function(evt) {	/* Get Upload progress */
						vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total); /* Update progress bar with upload progress */ 
					})
					.then(function(response) {
						var xml = $.parseXML(response);	/* parses XML data response to jQuery object to be stored in the database */
						var tagStrings = vm.tags.map(function(item) { return item['text']; });	/* maps the tag obects to an array of strings to be stored in the database */
						var key = data.fields.key;	/* File key to be stored in the DB */
						var url = data.url + '/' + key;	/* Access URL for if the file ACL is public-read */
						var fileDetails = {	/* Information to be stored in the database */
							name : vm.fileInfo.name + '.' + vm.fileInfo.extension,
							path : currentPath,
							type : vm.fileInfo.typeDB,
							key : key,
							size : vm.file.size,
							url : url,
							createdBy : authService.currentUser().firstName,
							coords : { 
								lat : vm.lat,
								lng : vm.lng
							},
							tags : tagStrings,
							icon : vm.fileInfo.icon
						}
						if(vm.textFileInfo.key) {	/* If the file was a pdf/docx file, store the text file key (used for analysis) */
							fileDetails.textFileKey = vm.textFileInfo.key;
						}
						if(vm.fileInfo.isTxtFile){	/* If the file was a txt file, set text file key identical to the actual file key (also used for analysis) */
							fileDetails.textFileKey = key;
						}

						filesService.addFile(fileDetails)	/* Save the file information to the database */
						.then(function(data) {
							processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
							logger.success(data.name + ' successfully uploaded', '', 'Success');
							setTimeout(function() {
								vm.modal.close(data);	/* Close modal if the file was uploaded successfully and return the new file */
							}, 1000);	/* Timeout function so the user can see the file uploaded successfully before closing modal */
						});
					}, function(error) {
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
						var xml = $.parseXML(error.data);
						logger.error($(xml).find("Message").text(), '', 'Error');
						vm.modal.close();
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
					vm.modal.close();
				});
			}

			/* For the animated submit button and other elements that should be disabled during event processing */
			function processingEvent(status, result) {
				vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
				vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */

				vm.isProcessing = status;	/* Processing flag for other view elements to check */
			}

			/* For changing the modal pages */
			function changeModalPage(page) {
				vm.currentModalPage = page;
				if(page === 2) {	/* Only fired when going back to the map page from the final page  */	
					setTimeout(function() {
						vm.map.invalidateSize();	/* Reinitialise the map container so it fits correctly */
						vm.map.setView(vm.posMarker.getLatLng(), vm.map.getZoom());	/* Goes to upload file position pin with the previous zoom level */
					}, 100);
				}
			}

			/* modal close and cancel functions */
			vm.modal = {
				close : function(newFile) {	/* Sends the new file information back when vm.modal.close(newFile) is called after upload success */
					$uibModalInstance.close(newFile);
				}, 
				cancel : function() {	/* Sends 'cancel' back when vm.modal.cancel() is called */
				$uibModalInstance.dismiss('cancel');
			}
		};
	});
}

})();