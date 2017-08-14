(function () { 

	"use strict";

	angular
	.module('nativeQDAApp')
	.controller('homeCtrl', homeCtrl);
	
	/* @ngInject */
	function homeCtrl (filesService, $scope, $filter, $compile, $window, $uibModal, logger, bsLoadingOverlayService, NgTableParams, analysisService, s3Service) {
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
				vm.map.fitBounds(posCicle.getBounds());
			});
			
			posMarker.on("popupclose", function() { vm.map.removeLayer(posCicle); });
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

				popupString += '<a ng-click="vm.viewFile(file)" class="btn btn-success" role="button">View</a> ' +
				'<a ng-click="vm.popupFileDetails(file)" class="btn btn-primary" role="button">Details</a> ' +
				'<a ng-click="vm.confirmDelete(file)" class="btn btn-danger" role="button">Delete</a>' +
				'</div>';

				// compiles the HTML so ng-click works
				var compiledPopupString = $compile(angular.element(popupString));
				var newScope = $scope.$new();

				// New scope variables for the compiled string above
				newScope.file = {
					name: file.name,
					path: file.path,
					key: file.key, 
					textFileKey: file.textFileKey
				};

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
		function viewFile(file) {
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
			s3Service.signDownload(file.path, file.name)
			.then(function(response) {
				// Remove the animation 1s after the signed URL is retrieved
				setTimeout(function(){
					newTab.document.getElementById("loader").remove();
				},1000);

				// Redirect the new tab to the signed URL
				// If the file is a document or text file, open in google docs viewer to view in the browser
				if(response.data.type === "document" || response.data.type === "text") {
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

			modalInstance.result.then(function() {});
		}

		function confirmDelete(file) {
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
				// If a text file was generated for analysis, delete that file too.
				// If the original file was a text file, just delete the original file
				if(file.textFileKey && file.textFileKey != file.key){
					s3Service.deleteFile(file.textFileKey);
				}
				removeMapMarker();
				logger.success("'" + file.name + "' was deleted successfully", "", "Success");
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
		
		$scope.colors = ["#fc0003", "#f70008", "#f2000d", "#ed0012", "#e80017", "#e3001c", "#de0021", "#d90026", "#d4002b", "#cf0030", "#c90036", "#c4003b", "#bf0040", "#ba0045", "#b5004a", "#b0004f", "#ab0054", "#a60059", "#a1005e", "#9c0063", "#960069", "#91006e", "#8c0073", "#870078", "#82007d", "#7d0082", "#780087", "#73008c", "#6e0091", "#690096", "#63009c", "#5e00a1", "#5900a6", "#5400ab", "#4f00b0", "#4a00b5", "#4500ba", "#4000bf", "#3b00c4", "#3600c9", "#3000cf", "#2b00d4", "#2600d9", "#2100de", "#1c00e3", "#1700e8", "#1200ed", "#0d00f2", "#0800f7", "#0300fc"];

		function getSlide(target, style) {
			var i = target.length;
			return {
				id: (i + 1),
				label: 'slide #' + (i + 1),
				img: 'http://lorempixel.com/450/300/' + style + '/' + ((i + 1) % 10) ,
				color: $scope.colors[ (i*10) % $scope.colors.length],
				odd: (i % 2 === 0)
			};
		}

		function addSlide(target, style) {
			target.push(getSlide(target, style));
		};

		$scope.carouselIndex = 3;
		$scope.carouselIndex2 = 0;
		$scope.carouselIndex2 = 1;
		$scope.carouselIndex3 = 5;
		$scope.carouselIndex4 = 5;
		
		vm.testImages = [
		{title: 'Visualisation #1', url: 'assets/img/carousels/recent/bar-chart-preview.png'},
		{title: 'Visualisation #2', url: 'assets/img/carousels/recent/chord-diagram-preview.png'},
		{title: 'Visualisation #3', url: 'assets/img/carousels/recent/concept-map-preview.png'},
		{title: 'Visualisation #4', url: 'assets/img/carousels/recent/word-cloud-preview.png'},
		{title: 'Visualisation #5', url: 'assets/img/carousels/recent/word-tree-preview.png'},
		];

		function addSlides(target, style, qty) {
			for (var i=0; i < qty; i++) {
				addSlide(target, style);
			}
		}
		
            // End to End swiping
            // load 130 images in main javascript container
            var slideImages = [];
            addSlides(slideImages, 'sports', 10);
            addSlides(slideImages, 'people', 10);
            addSlides(slideImages, 'city', 10);
            addSlides(slideImages, 'abstract', 10);
            addSlides(slideImages, 'nature', 10);
            addSlides(slideImages, 'food', 10);
            addSlides(slideImages, 'transport', 10);
            addSlides(slideImages, 'animals', 10);
            addSlides(slideImages, 'business', 10);
            addSlides(slideImages, 'nightlife', 10);
            addSlides(slideImages, 'cats', 10);
            addSlides(slideImages, 'fashion', 10);
            addSlides(slideImages, 'technics', 10);
            $scope.totalimg = slideImages.length;
            $scope.galleryNumber = 1;
            console.log($scope.galleryNumber);
            
            function getImage(target) {
            	var i = target.length
            	, p = (($scope.galleryNumber-1)*$scope.setOfImagesToShow)+i;
            	console.log("i=" + i + "--" + p);

            	return slideImages[p];
            }
            function addImages(target, qty) {

            	for (var i=0; i < qty; i++) {
            		addImage(target);
            	}
            }
            
            function addImage(target) {
            	target.push(getImage(target));
            }
            
            $scope.slides7 = [];
            $scope.carouselIndex7 = 0;
            $scope.setOfImagesToShow = 3;
            addImages($scope.slides7, $scope.setOfImagesToShow);
            $scope.loadNextImages = function() {
            	console.log("loading Next images");
            	if (slideImages[slideImages.length-1].id !== $scope.slides7[$scope.slides7.length-1].id) {
                    // Go to next set of images if exist
                    $scope.slides7 = [];
                    $scope.carouselIndex7 = 0;
                    ++$scope.galleryNumber;
                    addImages($scope.slides7, $scope.setOfImagesToShow);
                } else {
                    // Go to first set of images if not exist
                    $scope.galleryNumber = 1;
                    $scope.slides7 = [];
                    $scope.carouselIndex7 = 0;
                    addImages($scope.slides7, $scope.setOfImagesToShow);
                }
            }
            $scope.loadPreviousImages = function() {
            	if (slideImages[0].id !== $scope.slides7[0].id) {
                    // Go to previous set of images if exist
                    $scope.slides7 = [];
                    $scope.carouselIndex7 = 0;
                    --$scope.galleryNumber;
                    addImages($scope.slides7, $scope.setOfImagesToShow);
                } else {
                    // Go to last set of images if not exist
                    console.log("slideimageslength: " + slideImages.length + ", " + slideImages.length-1 / $scope.setOfImagesToShow);
                    // console.log("slideimageslength: " + slideImages.length );
                    $scope.galleryNumber = slideImages.length / $scope.setOfImagesToShow;
                    $scope.slides7 = [];
                    $scope.carouselIndex7 = 0;
                    addImages($scope.slides7, $scope.setOfImagesToShow);
                    console.log("no images left");
                }
                
            }
            
            

        }

    })();