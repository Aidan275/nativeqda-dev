/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc controller
* @name home.controller:homeCtrl
* @requires $scope
* @requires $filter
* @requires $compile
* @requires $window
* @requires $uibModal
* @requires NgTableParams
* @requires bsLoadingOverlayService
* @requires services.service:filesService
* @requires services.service:s3Service
* @requires services.service:mapService
* @requires services.service:authService
* @requires services.service:analysisService
* @requires services.service:logger
* @description The main homepage/dashboard of the application. Displays a small map and the recently
* uploaded files. 
*
* More to add.
*/

(function () { 

	"use strict";

	angular
	.module('home')
	.controller('homeCtrl', homeCtrl);
	
	/* @ngInject */
	function homeCtrl ($scope, $filter, $compile, $window, $uibModal, NgTableParams, bsLoadingOverlayService, filesService, s3Service, mapService, authService, analysisService, logger) {
		var vm = this;

		/* Bindable Functions */
		vm.getFileList = getFileList;
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;

		/* Bindable Data */
		vm.map = null;
		vm.posMarker = null;
		vm.lat = -34.4054039;	/* Default position is UOW */
		vm.lng = 150.87842999999998;
		vm.currentUser = authService.currentUser();

		/* File marker variables */
		vm.fileList = [];
		vm.markers = [];		
		vm.currentMarker = null;
		
		vm.pageHeader = {
			title: 'Dashboard',
			strapline: 'summary of recent activity'
		};

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
		* @methodOf home.controller:homeCtrl
		* @description Runs when the page first loads and starts the loading overlay for the map/file-list 
		* and calls the {@link map.controller:mapCtrl#methods_initMap initMap} function.
		*/
		function activate() {
			bsLoadingOverlayService.start({referenceId: 'home-map'});	/* Start animated loading overlay */
			bsLoadingOverlayService.start({referenceId: 'file-list'});	/* Start animated loading overlay */
			initMap();
		}

		/**
		* @ngdoc function
		* @name initMap
		* @methodOf home.controller:homeCtrl
		* @description Initialises the map setting up the initial settings such as default location, zoom level, map tiles
		* position marker, and sidebar. Next the functions to get the users location and the file markers from the database are called.
		*/
		function initMap() {
			var mapOptions = {
				center: [-34.4054039, 150.87842999999998],	/* Default position is UOW */
				zoom: 4
			};

			vm.map = L.map('map-homepage', mapOptions);

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

			geoLocateUser();	/* Gets the users position */
			getFileList();		/* Gets the files from the DB */
		}

		/**
		* @ngdoc function
		* @name geoLocateUser
		* @methodOf home.controller:homeCtrl
		* @description Geolocates the user. If locationfound, calls 
		* {@link home.controller:homeCtrl#methods_onLocationFound onLocationFound} 
		* to update the map with the user location. if locationerror, calls 
		* {@link home.controller:homeCtrl#methods_onLocationError onLocationError}
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
		* @methodOf home.controller:homeCtrl
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
		* @methodOf home.controller:homeCtrl
		* @description Displays error message to the user
		*/
		function onLocationError(error) {
			logger.error(error.message, error, 'Error');
		}

		/**
		* @ngdoc function
		* @name getFileList
		* @methodOf home.controller:homeCtrl
		* @description Uses the {@link services.service:filesService#methods_getFileList getFileList} 
		* function from {@link services.service:filesService filesService} to load the files from the database.
		* On success, calls {@link map.controller:mapCtrl#methods_addMapMarkers addMapMarkers} to add the files
		* to the map and the recent files table.
		*/
		function getFileList() {
			filesService.getFileList()
			.then(function(data) {
				vm.fileList = data;
				listFiles();
				addMapMarkers();
				getAnalysisList();
			}, function(err) {
				bsLoadingOverlayService.stop({referenceId: 'file-list'});	/* If error, stop animated loading overlays */
				bsLoadingOverlayService.stop({referenceId: 'home-map'});
			});
		}

		function getAnalysisList() {
			analysisService.listWatsonAnalysis()
			.then(function(data) {
				vm.analysisList = data;
				initDateGraph();
			});
		}

		function initDateGraph() {
			var earliestDate = null;
			var latestDate = null;

			/* Find the min and max dates */
			vm.analysisList.forEach(function(file, index) {
				if(index == 0) {
					earliestDate = file.dateCreated;
					latestDate = file.dateCreated;
				} else {
					if(earliestDate > file.dateCreated)
						earliestDate = file.dateCreated;
					if(latestDate < file.dateCreated)
						latestDate = file.dateCreated;
				}
			});

			/* Find the min and max dates */
			vm.fileList.forEach(function(file) {
				if(earliestDate > file.dateCreated)
					earliestDate = file.dateCreated;
				if(latestDate < file.dateCreated)
					latestDate = file.dateCreated;
			});

			earliestDate = earliestDate.substring(0, 10);
			latestDate = latestDate.substring(0, 10);

			var dateCounts = [
			{
				"date": earliestDate,
				"fileCount": 0,
				"analysisCount": 0
			}, {
				"date": latestDate,
				"fileCount": 0,
				"analysisCount": 0
			}
			];

			var startDate = moment(dateCounts[0].date);
			var endDate = moment(dateCounts[1].date);
			var days = endDate.diff(startDate, 'd', false);

			for (var i = 1; i < days; i++) {
				dateCounts.splice(i, 0, {"date" : startDate.add(1, 'd').toISOString().substring(0, 10), 'fileCount': 0, 'analysisCount': 0} )
			}

			vm.fileList.forEach(function(file, index) {
				for(var i = 0; i < dateCounts.length; i++) {
					if(dateCounts[i].date == file.dateCreated.substring(0, 10)) {
						dateCounts[i].fileCount++;
						break;
					}
				}
			});

			vm.analysisList.forEach(function(analysis, index) {
				for(var i = 0; i < dateCounts.length; i++) {
					if(dateCounts[i].date == analysis.dateCreated.substring(0, 10)) {
						dateCounts[i].analysisCount++;
						break;
					}
				}
			});

			drawDateGraph(dateCounts);
		}

		function drawDateGraph(data) {
			/* set the dimensions and margins of the graph */
			var margin = {top: 20, right: 20, bottom: 30, left: 50};
			var width = document.querySelector("#dateGraph").clientWidth - margin.left - margin.right;
			var height = 300 - margin.top - margin.bottom;

			/* parse the date / time */
			var parseTime = d3.timeParse("%Y-%m-%d");

			/* set the ranges */
			var x = d3.scaleTime().range([0, width]);
			var y = d3.scaleLinear().range([height, 0]);

			/* define the 1st line */
			var valueline = d3.line()
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.files); });

			/* define the 2nd line */
			var valueline2 = d3.line()
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.analyses); });

			/* append the svg obgect to the body of the page */
			/* appends a 'group' element to 'svg' */
			/* moves the 'group' element to the top left margin */
			var svg = d3.select("#dateGraph").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var legendNames = [{'name': 'Files'}, {'name': 'Analyses'}];

			var legend = svg.selectAll('g')
			.data(legendNames)
			.enter()
			.append('g')
			.attr('class', 'legend');

			legend.append('rect')
			.attr('x', width - 60)
			.attr('y', function(d, i) {
				return i * 20;
			})
			.attr('width', 10)
			.attr('height', 10)
			.style('fill', function(d) {
				if(d.name == 'Files')
					return 'green'
				else 
					return 'blue';
			});

			legend.append('text')
			.attr('x', width - 45)
			.attr('y', function(d, i) {
				return (i * 20) + 9;
			})
			.text(function(d) {
				return d.name;
			});

			data.forEach(function(d) {
				d.date = parseTime(d.date);
				d.files = d.fileCount;
				d.analyses = d.analysisCount;
			});

			/* Scale the range of the data */
			x.domain(d3.extent(data, function(d) { return d.date; }));
			y.domain([0, d3.max(data, function(d) {
				return Math.max(d.files, d.analyses); })]);

			/* Add the valueline path. */
			svg.append("path")
			.data([data])
			.attr("class", "line")
			.style("stroke", "green")
			.attr("d", valueline);

			/* Add the valueline2 path. */
			svg.append("path")
			.data([data])
			.attr("class", "line")
			.style("stroke", "blue")
			.attr("d", valueline2);

			/* Add the X Axis */
			svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

			/* Add the Y Axis */
			svg.append("g")
			.attr("class", "y axis")
			.call(d3.axisLeft(y));

			var mouseG = svg.append("g")
			.attr("class", "mouse-over-effects");

			mouseG.append("path")
			.attr("class", "mouse-line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.style("opacity", "0");

			var lines = document.getElementsByClassName('line');

			var mousePerLine = mouseG.selectAll('.mouse-per-line')
			.data(legendNames)
			.enter()
			.append("g")
			.attr("class", "mouse-per-line");

			mousePerLine.append("circle")
			.attr("r", 7)
			.style("stroke", function(d) {
				if(d.name == 'Files')
					return 'green'
				else 
					return 'blue';
			})
			.style("fill", "none")
			.style("stroke-width", "1px")
			.style("opacity", "0");

			mousePerLine.append("text")

			mouseG.append('svg:rect')
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'none')
			.attr('pointer-events', 'all')
			.on('mouseout', function() {
				d3.select(".mouse-line")
				.style("opacity", "0");
				d3.selectAll(".mouse-per-line circle")
				.style("opacity", "0");
				d3.selectAll(".mouse-per-line text")
				.style("opacity", "0");
			})
			.on('mouseover', function() {
				d3.select(".mouse-line")
				.style("opacity", "1");
				d3.selectAll(".mouse-per-line circle")
				.style("opacity", "1");
				d3.selectAll(".mouse-per-line text")
				.style("opacity", "1");
			})
			.on('mousemove', function() { 
				var mouse = d3.mouse(this);
				d3.select(".mouse-line")
				.attr("d", function() {
					var d = "M" + mouse[0] + "," + height;
					d += " " + mouse[0] + "," + 0;
					return d;
				});

				d3.selectAll(".mouse-per-line")
				.attr("transform", function(d, i) {
					var xDate = x.invert(mouse[0]),
					bisect = d3.bisector(function(d) { return d.date; }).right;

					var beginning = 0,
					end = lines[i].getTotalLength(),
					target = null;

					while (true){
						target = Math.floor((beginning + end) / 2);
						var pos = lines[i].getPointAtLength(target);
						if ((target === end || target === beginning) && pos.x !== mouse[0]) {
							break;
						}
						if (pos.x > mouse[0])      end = target;
						else if (pos.x < mouse[0]) beginning = target;
						else break; 
					}

					d3.select(this).select('text')
					.text(function(d) {
						if(d.name == 'Files')
							return "Files Uploaded: " + y.invert(pos.y).toFixed(0);
						else 
							return "Analyses Processed: " + y.invert(pos.y).toFixed(0);
					})
					.attr("transform", function(d) {
						if(width/mouse[0] < 2) {
							if(d.name == 'Files')
								return "translate(-120,-5)";
							else 
								return "translate(-155,-25)";
						} else {
							if(d.name == 'Files')
								return "translate(10,-5)";
							else 
								return "translate(10,-25)";
						}
						
					});

					return "translate(" + mouse[0] + "," + pos.y +")";
				});
			});

		}

		/**
		* @ngdoc function
		* @name addMapMarkers
		* @methodOf home.controller:homeCtrl
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
			});

vm.map.addLayer(vm.markers);	/* Adds the markers cluster group to the map */
bsLoadingOverlayService.stop({referenceId: 'home-map'});	/* Stop animated loading overlay */
}

		/**
		* @ngdoc function
		* @name listFiles
		* @methodOf home.controller:homeCtrl
		* @description Lists the 7 most recent files in the Recent Files table
		*/
		function listFiles() {
			vm.tableParams = new NgTableParams({
				count: 7,
				page: 1,
				sorting: {lastModified: "desc"}
			}, {
				counts: [],
				dataset: vm.fileList
			});   
			bsLoadingOverlayService.stop({referenceId: 'file-list'});	/* Stop animated loading overlay */
		}

		/**
		* @ngdoc function
		* @name viewFile
		* @param {Object} file File object
		* @methodOf home.controller:homeCtrl
		* @description Opens a file in a new tab, using google docs viewer if it is a document, overwise,
		* opens in the browser if natively supported. If not supported, a download prompt should be displayed.
		*/
		function viewFile(file) {

			/* Open a blank new tab while still in a trusted context to prevent a popup blocker warning */
			var newTab = $window.open("about:blank", '_blank')

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
		* @methodOf home.controller:homeCtrl
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

		/* End to End swiping */
		/* load 130 images in main javascript container */
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
			if (slideImages[slideImages.length-1].id !== $scope.slides7[$scope.slides7.length-1].id) {
				/* Go to next set of images if exist */
				$scope.slides7 = [];
				$scope.carouselIndex7 = 0;
				++$scope.galleryNumber;
				addImages($scope.slides7, $scope.setOfImagesToShow);
			} else {
				/* Go to first set of images if not exist */
				$scope.galleryNumber = 1;
				$scope.slides7 = [];
				$scope.carouselIndex7 = 0;
				addImages($scope.slides7, $scope.setOfImagesToShow);
			}
		}
		$scope.loadPreviousImages = function() {
			if (slideImages[0].id !== $scope.slides7[0].id) {
				/* Go to previous set of images if exist */
				$scope.slides7 = [];
				$scope.carouselIndex7 = 0;
				--$scope.galleryNumber;
				addImages($scope.slides7, $scope.setOfImagesToShow);
			} else {
				/* Go to last set of images if not exist */
				$scope.galleryNumber = slideImages.length / $scope.setOfImagesToShow;
				$scope.slides7 = [];
				$scope.carouselIndex7 = 0;
				addImages($scope.slides7, $scope.setOfImagesToShow);
			}

		}

	}

})();