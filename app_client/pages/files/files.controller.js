(function () { 

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	

	filesCtrl.$inject = ['$http', '$window', '$scope', '$uibModal', 'Upload', 'NgTableParams', 'filesService', 'authentication', 'initMapService'];
	function filesCtrl ($http, $window, $scope, $uibModal, Upload, NgTableParams, filesService, authentication, initMapService) {
		var vm = this;
		var marker = null;
		var map = null;

		vm.tags = [];
		vm.address = '';
		vm.formattedAddress = '';

		vm.currentPercentage = '0';

		vm.popupViewFile = popupViewFile;
		vm.getFileListS3 = getFileListS3;
		vm.doDeleteFile = doDeleteFile;
		vm.confirmDelete = confirmDelete;
		vm.onFileSelect = onFileSelect;
		vm.geocodeAddress = geocodeAddress;

		activate();

    	///////////////////////////

    	function activate() {
    		initMap();
    		getFileListDB();
    	}		

    	function popupViewFile(key) {
    		var modalInstance = $uibModal.open({
    			templateUrl: '/pages/files/viewFile/viewFile.view.html',
    			controller: 'viewFileCtrl as vm',
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

    	function doListFilesDB(data) {
    		fileList = data;
    		vm.tableParams = new NgTableParams({
    			sorting: {LastModified: "desc"}
    		}, {
    			dataset: fileList
    		});
    	};

		// need to work on back end still
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

		function getFileListS3() {
			filesService.getFileListS3()
			.then(function(response) {
				//syncDB(response.data);
				doListFilesS3(response.data.Contents);
			}, function(err) {
				console.log(err);
			});
		};

		function getFileListDB() {
			filesService.getFileListDB()
			.then(function(response) {
				doListFilesDB(response.data);
			}, function(err) {
				console.log(err);
			});
		};

		function doDeleteFileDB(key) {
			filesService.deleteFileDB(key)
			.then(function(response) {
				getFileListDB();
			}, function(err) {
				console.log(err);
			});
		}

		function doDeleteFile(key) {
			filesService.deleteFileS3({key: key})
			.then(function(response) {
				doDeleteFileDB(key);
			});
		};

		function confirmDelete(key, fileName) {
			var deleteFile = $window.confirm("Are you sure you want to delete " + fileName + "?");
			if(deleteFile){
				vm.doDeleteFile(key);
			}
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
						filesService.addFileDB(fileDetails)
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

		function initMap() {
			initMapService.init
			.then(function(){
				displayMap();
			});
		}

		function displayMap() {
			var location = new google.maps.LatLng(-34.406749, 150.878473);
			var mapCanvas = document.getElementById('file-map');
			var mapOptions = {
				zoom: 13,
				center: location,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map(mapCanvas, mapOptions);

			marker = new google.maps.Marker({
				draggable: true,
				position: location,
				map: map,
				title: 'Latitude: ' + location.lat() + '\nLongitude: ' + location.lng()
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
	}

})();