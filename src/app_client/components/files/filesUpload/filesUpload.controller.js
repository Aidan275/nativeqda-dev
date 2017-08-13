(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesUploadCtrl', filesUploadCtrl);
	
	/* @ngInject */
	function filesUploadCtrl(currentPath, mapService, $http, $window, $scope, $uibModalInstance, Upload, NgTableParams, filesService, authentication, logger, $filter, $compile) {
		var vm = this;

		vm.currentModalPage = 1;	/* prevent the modal content from suddenly appearing once the modal is ready */

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
			vm.markers = L.markerClusterGroup({showCoverageOnHover: false});
			vm.posMarker = null;
			vm.posMarkerMoved = false;	/* After moving the marker, the accuracy circle will be removed, i.e. posMarkerMoved = true */
			vm.lat = -34.4054039;	/* Default position is UOW */
			vm.lng = 150.87842999999998;
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
				vm.posMarker = L.marker([vm.lat, vm.lng], { icon: posIcon, draggable: true, zIndexOffset: 1000 })
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
				getFileList();	/* Gets all the files from the database */
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
				filesService.getFileListDB()
				.then(function(response) {
					vm.fileList = response.data;
					addMapMarkers();
				});
			}

			/* Adds markers for the files retrieved from the database */
			function addMapMarkers() {
				/* For each file, a marker is added to the marker Cluster Group to be displayed on the map. */
				/* If the marker is clicked, it sets the upload marker to the file's location. */
				vm.fileList.forEach(function(file) {
					var lat = file.coords.coordinates[1];
					var lng = file.coords.coordinates[0];
					var marker = L.marker([lat, lng], { icon: defaultIcon })
					.bindTooltip(	'<strong>File Name:</strong> ' + file.name + '<br />' + 
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


			function onFileSelect(uploadFiles) {
				if (uploadFiles.length > 0 ) {
					/* Checks if file's size is less than 10 MB */
					if(uploadFiles[0].size < 10485760) {
						vm.file = uploadFiles[0];
						vm.fileInfo = {
							name: vm.file.name.replace(/\.[^/.]+$/, ""),	/* Extracts everything before the file extension */
							extension: (vm.file.name.split('.').pop()).toLowerCase(),	/* Extracts the file extension */
							type: vm.file.type
						};
						/* If uploading a text/plain file, change the type to include charset=utf-8 so special characters are encoded properly */
						if (vm.fileInfo.type === "text/plain"){
							vm.fileInfo.type = "text/plain; charset=utf-8";
						}

						processFile();

						vm.currentModalPage = 2;
						setTimeout(function() {
							vm.map.invalidateSize();
							vm.map.setView(vm.posMarker.getLatLng(), 15);
						}, 100);
					} else {
						logger.error("Maximum file size is 10 MB. \nPlease select a smaller file.", "", "Error");	/* If larger, display message and reinitialise the file variables */
						vm.file = null;
						vm.fileInfo = {};
						document.getElementById("file-input").value = "";
					}
				}
			}

			function processFile() {
				if(vm.file) {
					switch (vm.fileInfo.extension) {
						case 'pdf':
						vm.fileInfo.typeDB = "document";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-pdf-o";	/* PDF icon type */
						convertPDFToText()
						break;
						case 'docx':
						vm.fileInfo.typeDB = "document";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-word-o";	/* Word icon type */	
						convertDocxToText();
						break;
						case 'doc':
						vm.fileInfo.typeDB = "document";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-word-o";	/* Word icon type */
						break;
						case 'txt':
						vm.fileInfo.typeDB = "text";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-text-o";	/* Text icon type */
						vm.fileInfo.isTxtFile = true;
						break;
						case 'gif':
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'bmp':
						case 'tif':
						vm.fileInfo.typeDB = "image";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-image-o";	/* Image icon type */
						break;
						default: 
						vm.fileInfo.typeDB = "file";	/* File type - stored in the DB */
						vm.fileInfo.icon = "fa fa-file-o";	/* Generic File icon type */
					}
				} else {
					logger.error("Please select a file to upload.", "", "Error");
				}
			}

			function convertPDFToText() {
				vm.isProcessing = true;
				var fileReader = new FileReader();

				fileReader.onload = function() { 
					var arrayBuffer = this.result;	

					getPDFText(arrayBuffer).then(function (text) {
						createTextFile(text);
					}, function (error) {
						logger.error(error.message, error, 'Error');
						vm.modal.close();
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

			/* Testing DocxJS for converting docx files to text... looks good */
			function convertDocxToText() {
				vm.isProcessing = true;
				var docxJS = new DocxJS();

				docxJS.parse(vm.file, function() {
					docxJS.getPlainText(function(text){
						createTextFile(text);
					});
				}, function (error) {
					logger.error(error.msg, error, 'Error');
					vm.modal.close();
				});
			}

			function createTextFile(text) {
				vm.textFile = new File([text], vm.fileInfo.name, {type: "text/plain; charset=utf-8"});

				vm.textFileInfo = {
					name: vm.textFile.name,
					extension: "txt",
					type: vm.textFile.type
				};

				vm.isProcessing = false;
				$scope.$apply();
			}

			function uploadFile() {
				if(vm.fileInfo.name){
					processingEvent(true, null);
					if(vm.textFile) {
						uploadTextFile();
					} else {
						uploadActualFile();
					}
				} else {
					logger.error('Please enter a file name' ,'', 'Error');
				}

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
						/* Use the same key but with the original file extension (e.g. use .pdf not .txt) */
						vm.fileInfo.key = vm.textFileInfo.key.substring(0, vm.textFileInfo.key.indexOf('-'));
						vm.fileInfo.key += "-" + vm.fileInfo.name + '.' + vm.fileInfo.extension;
						uploadActualFile();
					}, function(error) {
						var xml = $.parseXML(error.data);
						processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
						logger.error($(xml).find("Message").text(), '', 'Error');
						vm.modal.close();
					});
				}, function(err) {
					processingEvent(false, 'error');	/* ng-bs-animated-button status & result */
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
						/* parses XML data response to jQuery object to be stored in the database */
						var xml = $.parseXML(response.data);
						/* maps the tag obects to an array of strings to be stored in the database */
						var tagStrings = vm.tags.map(function(item) {
							return item['text'];
						});
						var key = result.data.fields.key;
						var url = result.data.url + '/' + encodeURIComponent(key);	/* Encode the key for the API URL incase it includes reserved characters (e.g '+', '&') */
						var fileDetails = {
							name : vm.fileInfo.name + '.' + vm.fileInfo.extension,
							path : currentPath,
							type : vm.fileInfo.typeDB,
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
							processingEvent(false, 'success');	/* ng-bs-animated-button status & result */
							console.log(vm.fileInfo.name + ' successfully added to DB');
							logger.success(vm.fileInfo.name + ' successfully uploaded', '', 'Success');
							setTimeout(function() {
								vm.modal.close(response.data);	/* Close modal if the file was uploaded successfully and return the new file */
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
				});
			}

			/* For the animated submit button and other elements that should be disabled during event processing */
			function processingEvent(status, result) {
				vm.isSubmittingButton = status;	/* ng-bs-animated-button status */
				vm.resultButton = result;	/* ng-bs-animated-button result (error/success) */

				vm.isProcessing = status;	/* Processing flag for other view elements to check */
			}

			function changeModalPage(page) {
				vm.currentModalPage = page;
				if(page === 2) {
					setTimeout(function() {
						vm.map.invalidateSize();
						vm.map.setView(vm.posMarker.getLatLng(), vm.map.getZoom());
					}, 100);
				}
			}

			vm.modal = {
				close : function(newFile) {
					$uibModalInstance.close(newFile);
				}, 
				cancel : function() {
					$uibModalInstance.dismiss('cancel');
				}
			};
		});
}

})();