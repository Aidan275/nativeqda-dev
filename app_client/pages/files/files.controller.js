(function () { 

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	

	filesCtrl.$inject = ['$http', '$window', '$scope', '$uibModal', 'Upload', 'NgTableParams', 'files', 'authentication', 'GoogleMapsInitialiser'];
	function filesCtrl ($http, $window, $scope, $uibModal, Upload, NgTableParams, files, authentication, GoogleMapsInitialiser) {
		var vm = this;

		vm.tags = [];
		vm.address = 'Wollongong';
		vm.formattedAddress = '';

		vm.currentPercentage = '0';

		vm.popupViewFile = function(file) {
			var modalInstance = $uibModal.open({
				templateUrl: '/pages/files/viewFile/viewFile.view.html',
				controller: 'viewFileCtrl as vm',
				size: 'xl',
				resolve: {
					file: function () {
						return file;
					}
				}
			});

			modalInstance.result.then(function() {

			});
		};

		doListFilesDB = function(data) {
			fileList = data;
			vm.tableParams = new NgTableParams({
				sorting: {LastModified: "desc"}
			}, {
				dataset: fileList
			});
		};

		// need to work on back end still
		/*
		syncDB = function(data) {
			var fileList = data.Contents;

			fileList.forEach(function(file) {
				files.syncDBwithS3({key: file.Key})
				.then(function(response) {
					console.log(response);
				}, function(err) {
					console.log(err);
				});
			});

			doListFiles(data);
		}
		*/

		vm.getFileListS3 = function() {
			files.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			}, function(err) {
				console.log(err);
			});
		};

		getFileListDB = function() {
			files.getFileListDB()
			.then(function(response) {
				console.log(response.data);
				doListFilesDB(response.data);
			}, function(err) {
				console.log(err);
			});
		};

		doDeleteFileDB = function(key) {
			files.deleteFileDB(key)
			.then(function(response) {
				getFileListDB();
			}, function(err) {
				console.log(err);
			});
		}

		vm.doDeleteFile = function(key) {
			files.deleteFileS3({key: key})
			.then(function(response) {
				doDeleteFileDB(key);
			}, function(err) {
				console.log(err);
			});
		};

		vm.confirmDelete = function(key, fileName) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				vm.doDeleteFile(key);
			}
		};

		// Gets a signed URL for uploading a file then uploads the file to S3 with this signed URL
		// If successful, the file info is then posted to the DB
		vm.onFileSelect = function(uploadFiles) {
			if (uploadFiles.length > 0) {
				var filename = uploadFiles[0].name;
				var type = uploadFiles[0].type;
				var query = {
					filename: filename,
					type: type
				};
				files.signUploadS3(query)
				.then(function(result) {
					Upload.upload({
						method: 'POST',
						url: result.data.url, 
						fields: result.data.fields, 
						file: uploadFiles[0]
					}).progress(function(evt) {
						vm.currentPercentage = parseInt(100.0 * evt.loaded / evt.total);
						console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).then(function(response) {
						console.log('file ' + response.config.file.name + 'is uploaded successfully. Response: ' + response.data);
						console.log(response);
						// parses XML data response to jQuery object to be stored in the database
						var xml = $.parseXML(response.data);
						// maps the tag obects to an array of strings to be stored in the database
						var tagStrings = vm.tags.map(function(item) {
							return item['text'];
						});
						var fileDetails = {
							name : filename,
							eTag : $(xml).find("ETag").text(),
							key : $(xml).find("Key").text(),
							size : response.config.file.size,
							url : $(xml).find("Location").text(),
							createdBy : authentication.currentUser().name,
							lat : vm.lat,
							lng : vm.lng,
							tags : tagStrings
						}
						files.addFileDB(fileDetails)
						.then(function(response) {
							console.log(response);
							getFileListDB();
						}, function(err) {
							console.log(err);
						});
					}, function(err) {
						console.log(err);
					});
				}, function(err) {
					console.log(err);
				});
			}
		};

		initMap = function() {
			GoogleMapsInitialiser.mapsInitialised
			.then(function(){
				var markerPos = new google.maps.LatLng(-34.406749, 150.878473);

				var myOptions = {
					zoom: 13,
					center: markerPos,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				var map = new google.maps.Map(document.getElementById("file-map"), myOptions);

				var marker = new google.maps.Marker({
					draggable: true,
					position: markerPos,
					map: map,
					title: 'Latitude: ' + markerPos.lat() + '\nLongitude: ' + markerPos.lng()
				});

				google.maps.event.addListener(marker, 'dragend', function(event) {
					marker.setTitle('Latitude: ' + event.latLng.lat() + '\nLongitude: ' + event.latLng.lng());
					vm.lat = event.latLng.lat();
					vm.lng = event.latLng.lng();
					$scope.$apply();
				});

				google.maps.event.addListener(map, 'click', function(event) {
					marker.setPosition(event.latLng);
					marker.setTitle('Latitude: ' + event.latLng.lat() + '\nLongitude: ' + event.latLng.lng());
					vm.lat = event.latLng.lat();
					vm.lng = event.latLng.lng();
					$scope.$apply();
				});

				vm.geocodeAddress = function() {
					var geocoder = new google.maps.Geocoder();
					geocoder.geocode({'address': vm.address}, function(results, status) {
						if (status === 'OK') {
							var lat = results[0].geometry.location.lat();
							var lng = results[0].geometry.location.lng();
							marker.setPosition(results[0].geometry.location);
							marker.setTitle('Latitude: ' + lat + '\nLongitude: ' + lng);
							map.panTo(new google.maps.LatLng(lat,lng));
							vm.lat = lat;
							vm.lng = lng;
							vm.formattedAddress = results[0].formatted_address;
							$scope.$apply();
						} else {
							alert('Geocode was not successful for the following reason: ' + status);
						}
					});
				}

			});
		}

		initMap();
		getFileListDB();
	}

})();