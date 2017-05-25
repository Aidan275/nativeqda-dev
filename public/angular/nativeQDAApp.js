angular.module('nativeQDAApp', []);



var _isNumeric = function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function () {
	return function (distance){
		var numDistance = distance/1000;
		var unit;

		if (distance && _isNumeric(distance)) {
			if (numDistance > 1) {
				numDistance = parseFloat(numDistance).toFixed(1);
				unit = ' km';
			} else {
				numDistance = parseInt(numDistance * 1000, 10);
				unit = ' m';
			}
			return numDistance + unit;

		} else if (distance==0){
			return "0";
		} else {
			return "?";
		}
	};
};

var ratingStars = function () {
	return {
		scope: {
			thisRating : '=rating'
		},
		templateUrl: '/angular/rating-stars.html'
	};
};

var geolocation = function () {
	var getPosition = function (cbSuccess, cbError, cbNoGeo) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
		}
		else {
			cbNoGeo();
		}
	};
	return {
		getPosition : getPosition
	};
};

var locationListCtrl = function ($scope, nativeQDAData, geolocation) { 
	$scope.message = "Checking your location";

	$scope.getData = function (position) {
		var lat = position.coords.latitude,
		lng = position.coords.longitude;
		$scope.message = "Searching for nearby places";
		nativeQDAData.locationByCoords(lat, lng)
		.success(function(data) {
			$scope.message = data.length > 0 ? "" : "No locations found";
			$scope.data = { locations: data };
		})
		.error(function (e) {
			$scope.message = "Sorry, something's gone wrong";
		});
	};

	$scope.showError = function (error) {
		$scope.$apply(function() {
			$scope.message = error.message;
		});
	};

	$scope.noGeo = function () {
		$scope.$apply(function() {
			$scope.message = "Geolocation not supported by this browser.";
		});
	};

	geolocation.getPosition($scope.getData,$scope.showError,$scope.noGeo);
};

var nativeQDAData = function ($http) {
	var locationByCoords = function (lat, lng) {
		return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=100000');
	};
	return {
		locationByCoords : locationByCoords
	};
}

angular
.module('nativeQDAApp')
.controller('locationListCtrl', locationListCtrl)
.filter('formatDistance', formatDistance)
.directive('ratingStars', ratingStars)
.directive('initBind', initBind)
.service('nativeQDAData', nativeQDAData)
.service('geolocation', geolocation);