(function () { 

	angular
	.module('nativeQDAApp')
	.filter('formatDistance', formatDistance);

	var _isNumeric = function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

	function formatDistance () {
		return function (distance) {
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
			} else {
				return "?";
			}
		};
	}

})();