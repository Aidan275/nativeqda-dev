(function () { 

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	

	filesCtrl.$inject = ['mapService', '$http', '$window', '$scope', '$uibModal', 'Upload', 'NgTableParams', 'filesService', 'authentication', 'logger'];
	function filesCtrl (mapService, $http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, logger) {
		var vm = this;

		var map = null;
		var marker = null;
		var fileList = null;

		vm.lat = -34.4054039;	// Default position is UOW
		vm.lng = 150.87842999999998;
		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';

		vm.currentPercentage = '0';

		vm.popupFileDetails = popupFileDetails;
		vm.getFileListS3 = getFileListS3;
		vm.confirmDelete = confirmDelete;
		vm.onFileSelect = onFileSelect;
		vm.geocodeAddress = geocodeAddress;
		vm.viewFile = viewFile;

		activate();

    	///////////////////////////

    	function activate() {
    		initMap();
    		getFileList();
    	}

    	function initMap() {
    		var position = new google.maps.LatLng(vm.lat, vm.lng);
    		var mapCanvas = document.getElementById('map-files-page');
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

    		marker = new google.maps.Marker({
    			draggable: true,
    			position: position,
    			map: map,
    			title: 'Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng
    		});

    		google.maps.event.addListener(marker, 'dragend', function(event) {
    			vm.lat = event.latLng.lat();
    			vm.lng = event.latLng.lng();
    			marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
    			$scope.$apply();
    		});

    		google.maps.event.addListener(map, 'click', function(event) {
    			vm.lat = event.latLng.lat();
    			vm.lng = event.latLng.lng();
    			marker.setPosition(event.latLng);
    			marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
    			$scope.$apply();
    		});

    		mapService.getPosition(getGeoData);
    	}

    	function getGeoData(position) {
    		vm.lat = position.coords.latitude;
    		vm.lng = position.coords.longitude;
    		updateUserPos();
    	}

    	function updateUserPos() {
    		var userPos = new google.maps.LatLng(vm.lat, vm.lng);
    		marker.setPosition(userPos);
    		marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);
    		map.setZoom(13);
    		map.panTo(userPos);
    		$scope.$apply();
    	}

    	function geocodeAddress() {
    		var geocoder = new google.maps.Geocoder();
    		geocoder.geocode({'address': vm.address}, function(results, status) {
    			if (status === 'OK') {
    				vm.lat = results[0].geometry.location.lat();
    				vm.lng = results[0].geometry.location.lng();
    				vm.formattedAddress = results[0].formatted_address;

    				marker.setPosition(results[0].geometry.location);
    				marker.setTitle('Latitude: ' + vm.lat + '\nLongitude: ' + vm.lng);

    				map.panTo(new google.maps.LatLng(vm.lat,vm.lng));

    				$scope.$apply();
    			} else if (status === 'ZERO_RESULTS') {
    				toastr.warning('Warning: Address not found', 'Warning', { "positionClass": "toast-top-center"})
    			} else {
    				toastr.error('Geocode failed: ' + status, 'Error', { "positionClass": "toast-top-center"})
    			}
    		});
    	}

		// Gets all the files from the MongoDB database to be displayed on the map
		function getFileList() {
			filesService.getFileListDB()
			.then(function(response) {
				fileList = response.data;
				listFiles();
			});
		}

		function listFiles() {
			vm.tableParams = new NgTableParams({
				sorting: {LastModified: "desc"}
			}, {
				dataset: fileList
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
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
		};

		function confirmDelete(name, key) {
			var doDelete = $window.confirm("Are you sure you want to delete " + name + "?");
			if(doDelete){
				deleteFileDB(name, key);
			}
		};

		function deleteFileDB(name, key) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				deleteFileS3(name, key);
			});
		}

		function deleteFileS3(name, key) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				logger.success('File ' + name + ' deleted successfully', '', 'Success');
				getFileList();
			});
		};

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		// need to make neater
		function onFileSelect(uploadFiles) {
			if (uploadFiles.length > 0) {
				var filename = uploadFiles[0].name;
				var type = uploadFiles[0].type;
				var query = {
					filename: filename,
					type: type
				};
				filesService.signUploadS3(query)
				.then(function(result) {
					Upload.upload({
						method: 'POST',
						url: result.data.url, 
						fields: result.data.fields, 
						file: uploadFiles[0]
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
						var url = result.data.url + '/' + key;
						var fileDetails = {
							name : filename,
							key : key,
							size : response.config.file.size,
							url : url,
							createdBy : authentication.currentUser().name,
							lat : vm.lat,
							lng : vm.lng,
							tags : tagStrings
						}
						filesService.addFileDB(fileDetails)
						.then(function(response) {
							console.log(filename + ' successfully added to DB');
							logger.success(filename + ' successfully uploaded', '', 'Success');
							getFileList();
						});
					}, function(error) {
						var xml = $.parseXML(error.data);
						logger.error($(xml).find("Message").text(), '', 'Error');
					});
				});
			}
		};

		// need to work on back end still
		// Thinking if S3 and the DB become unsynced, such as a file in the DB that's 
		// not on S3, or vice-versa, this will re-sync them. Maybe provide settings button
		// to re-sync or do it periodically (maybe when a user logs in?).

		/*
		function syncDB(data) {
			var fileList = data.Contents;

			fileList.forEach(function(file) {
				filesService.syncDBwithS3({key: file.Key})
				.then(function(response) {
					console.log(response);
				}, function(err) {
					console.log(err);
				});
			});

			doListFiles(data);
		}
		*/

		// not using at the moment, getting file details from DB 
		// Amazon S3 free tier only provides 2000 put requests and 20000 get requests a month
		function getFileListS3() {
			filesService.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			}, function(err) {
				console.log(err);
			});
		};
	}

})();