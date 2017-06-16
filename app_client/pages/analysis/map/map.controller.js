(function () {

	angular
	.module('nativeQDAApp')
	.controller('mapCtrl', mapCtrl);

	mapCtrl.$inject = ['mapService', 'filesService', '$scope', '$filter', '$compile', '$window', '$uibModal', 'logger'];
	function mapCtrl (mapService, filesService, $scope, $filter, $compile, $window, $uibModal, logger) {
		var vm = this;

		var lat = -34.4054039;	// Default position is UOW
		var lng = 150.87842999999998;
		var fileList = null;
		var map = null;
		var kangarooMarkers = [];
		var kiwiMarkers = [];
		var kaguMarkers = [];
		var kangarooMarkerCluster = null;
		var kiwiMarkerCluster = null;
		var kaguMarkerCluster = null;

		vm.getFileList = getFileList;
		vm.viewFile = viewFile;
		vm.popupFileDetails = popupFileDetails;
		vm.confirmDelete = confirmDelete;

		activate();

    	///////////////////////////

    	function activate() {
    		initMap(lat, lng);
    	}

    	function initMap(lat, lng) {
    		var position = new google.maps.LatLng(lat, lng);
    		var mapCanvas = document.getElementById('map');
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

    		map = new google.maps.Map(mapCanvas, mapOptions);

    		mapService.getPosition(getGeoData);
    		getFileList();
    	}

		// If getPosition returns successfully load the map at the users position
		function getGeoData(position) {
			lat = position.coords.latitude;
			lng = position.coords.longitude;
			updateUserPos();
		}

		function updateUserPos() {
			var userPos = new google.maps.LatLng(lat, lng);
			var marker = new google.maps.Marker({
				position: userPos,
				map: map,
				title: 'Your Position'
			});
			map.setZoom(13);
			map.panTo(userPos);
		}

    	// Gets all the files from the MongoDB database to be displayed on the map
    	function getFileList() {
    		filesService.getFileListDB()
    		.then(function(response) {
    			fileList = response.data;
    			clearMarkers();
    			addMapMarkers();
    		});
    	}

    	function clearMarkers() {
    		for (var i = 0; i < kangarooMarkers.length; i++) {
    			kangarooMarkers[i].setMap(null);
    		}
    		for (var i = 0; i < kiwiMarkers.length; i++) {
    			kiwiMarkers[i].setMap(null);
    		}
    		for (var i = 0; i < kaguMarkers.length; i++) {
    			kaguMarkers[i].setMap(null);
    		}
    		kangarooMarkers = [];
    		kiwiMarkers = [];
    		kaguMarkers = [];
    		if(kangarooMarkerCluster)
    			kangarooMarkerCluster.clearMarkers();
    		if(kiwiMarkerCluster)
    			kiwiMarkerCluster.clearMarkers();
    		if(kaguMarkerCluster)
    			kaguMarkerCluster.clearMarkers();
    	}

    	// Adds markers for the files retrieved from the MongoDB database
    	function addMapMarkers() {
    		var icons = {
    			australia: {
    				icon: '/images/map/icons/kangaroo-markers/kangaroo-marker.png'
    			},
    			newZealand: {
    				icon: '/images/map/icons/kiwi-markers/kiwi-marker.png'
    			},
    			newCaledonia: {
    				icon: '/images/map/icons/kagu-markers/kagu-marker.png'
    			}
    		};

    		var infowindow = new google.maps.InfoWindow();

			// For each file returned from the DB, a marker with an info 
			// window is created. Each marker is then added to its 
			// corresponding marker array to be displayed on the map
			fileList.forEach(function(file) {
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(file.coords.lat, file.coords.lng),
					icon: icons['australia'].icon,
					title: file.name
				});

				console.log(file.tags.length);

				var contentString = '<div class="info-window">' +
				'<h3>' + file.name + '</h3>' +
				'<p>Created By: ' + file.createdBy + '</p>' +
				'<p>Size: ' + $filter('formatFileSize')(file.size, 2) + '</p>' +	// using formatFileSize filter to format the file size
				'<p>Last Modified: ' + $filter('date')(file.lastModified, "dd MMMM, yyyy h:mm a") + '</p>';

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

				marker.addListener('click', function () {
					infowindow.setContent(compiledContentString[0]);
					infowindow.open(map, marker);
				});

				if(marker.icon == '/images/map/icons/kangaroo-markers/kangaroo-marker.png'){
					kangarooMarkers.push(marker);
				} else if(marker.icon == '/images/map/icons/kiwi-markers/kiwi-marker.png'){
					kiwiMarkers.push(marker);
				} else if(marker.icon == '/images/map/icons/kagu-markers/kagu-marker.png'){
					kaguMarkers.push(marker);
				}
			});

			kangarooMarkerCluster = new MarkerClusterer(map, kangarooMarkers, {imagePath: '/images/map/icons/kangaroo-markers/m'});
			kiwiMarkerCluster = new MarkerClusterer(map, kiwiMarkers, {imagePath: '/images/map/icons/kiwi-markers/m'});
			kaguMarkerCluster = new MarkerClusterer(map, kaguMarkers, {imagePath: '/images/map/icons/kagu-markers/m'});
		}

		// Get a signed URL to download the requested file from S3 
		// and if successful, open the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		function popupFileDetails(key) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/files/fileDetails/fileDetails.view.html',
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

		function confirmDelete(key, fileName) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				deleteFileDB(key, fileName);
			}
		}

		function deleteFileDB(key, fileName) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(key, fileName);
			});
		}

		function deleteFileS3(key, fileName) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + fileName + ' deleted successfully', '', 'Success');
				getFileList();
			});
		}
	}

})();