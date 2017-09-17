(function () {

	angular
	.module('map')
	.controller('heatmapCtrl', heatmapCtrl);

    /* @ngInject */
	function heatmapCtrl ($scope) {
		var vm = this;
		var lat = -33.848192;
		var lng = 151.061857;
		var mapZoom = 10;

		vm.radiusValue = 100;
		vm.opacityValue = 0.6;
		vm.bothOver = true;
		vm.fatherOver = true;
		vm.MotherOver = true;
		vm.bothAus = true;

		initMap(lat ,lng);

		function initMap(lat, lng) {
			var location = new google.maps.LatLng(lat, lng);
			var mapCanvas = document.getElementById('map');
			var mapOptions = {
				center: location,
				zoom: mapZoom,
				panControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: true,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle.DEFAULT,
					position: google.maps.ControlPosition.TOP_RIGHT
				},
			}

			var bothOverData = [
			// Inner West - Inner West, NSW, Australia
			{location: new google.maps.LatLng(-33.8584827,151.12866859999997), weight: 9029},
			// Albury - Albury NSW 2640, Australia
			{location: new google.maps.LatLng(-36.0737293,146.91354179999996), weight: 358},
			// Ryde - Ryde NSW 2112, Australia
			{location: new google.maps.LatLng(-33.81527799999999,151.10111099999995), weight: 3235},
			// Baulkham Hills & Hawkesbury - Baulkham Hills NSW 2153, Australia
			{location: new google.maps.LatLng(-33.76288,150.99212), weight: 7427},
			// Blacktown - Blacktown NSW 2148, Australia
			{location: new google.maps.LatLng(-33.771,150.9063), weight: 21538},
			// City & Inner South - Sydney NSW 2000, Australia
			{location: new google.maps.LatLng(-33.8688197,151.20929550000005), weight: 4163},
			// North Sydney & Hornsby - North Sydney NSW 2060, Australia
			{location: new google.maps.LatLng(-33.83965,151.20541000000003), weight: 8865},
			// Northern Beaches - Northern Beaches, NSW, Australia
			{location: new google.maps.LatLng(-33.68919759999999,151.26853819999997), weight: 1618},
			// Outer Southwest - Sydney Southwest Private Hospital - 40 Bigge St, Liverpool NSW 2170, Australia
			{location: new google.maps.LatLng(-33.91735159999999,150.9283736), weight: 5627},
			// Outer West Blue Mountains - Blue Mountains, New South Wales, Australia
			{location: new google.maps.LatLng(-33.49999729999999,150.2499997), weight: 3383},
			// Parramatta - Parramatta NSW 2150, Australia
			{location: new google.maps.LatLng(-33.81499999999999,151.00111100000004), weight: 27386},
			// South West - Elizabeth Hills NSW 2171, Australia
			{location: new google.maps.LatLng(-33.90006659999999,150.84785220000003), weight: 11435},
			// Sutherland - Sutherland NSW 2232, Australia
			{location: new google.maps.LatLng(-34.03314,151.05830000000003), weight: 1552},
			// Central Coast - Central Coast NSW, Australia
			{location: new google.maps.LatLng(-33.3529519,151.44354739999994), weight: 979},
			// Greater Sydney - Sydney Metropolitan Area, NSW, Australia
			{location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 121088},
			];

			var fatherOverDate = [
			// Inner West - Inner West, NSW, Australia
			{location: new google.maps.LatLng(-33.8584827,151.12866859999997), weight: 187},
			// Albury - Albury NSW 2640, Australia
			{location: new google.maps.LatLng(-36.0737293,146.91354179999996), weight: 18},
			// Ryde - Ryde NSW 2112, Australia
			{location: new google.maps.LatLng(-33.81527799999999,151.10111099999995), weight: 64},
			// Baulkham Hills & Hawkesbury - Baulkham Hills NSW 2153, Australia
			{location: new google.maps.LatLng(-33.76288,150.99212), weight: 141},
			// Blacktown - Blacktown NSW 2148, Australia
			{location: new google.maps.LatLng(-33.771,150.9063), weight: 224},
			// City & Inner South - Sydney NSW 2000, Australia
			{location: new google.maps.LatLng(-33.8688197,151.20929550000005), weight: 130},
			// North Sydney & Hornsby - North Sydney NSW 2060, Australia
			{location: new google.maps.LatLng(-33.83965,151.20541000000003), weight: 202},
			// Northern Beaches - Northern Beaches, NSW, Australia
			{location: new google.maps.LatLng(-33.68919759999999,151.26853819999997), weight: 96},
			// Outer Southwest - Sydney Southwest Private Hospital - 40 Bigge St, Liverpool NSW 2170, Australia
			{location: new google.maps.LatLng(-33.91735159999999,150.9283736), weight: 132},
			// Outer West Blue Mountains - Blue Mountains, New South Wales, Australia
			{location: new google.maps.LatLng(-33.49999729999999,150.2499997), weight: 165},
			// Parramatta - Parramatta NSW 2150, Australia
			{location: new google.maps.LatLng(-33.81499999999999,151.00111100000004), weight: 179},
			// South West - Elizabeth Hills NSW 2171, Australia
			{location: new google.maps.LatLng(-33.90006659999999,150.84785220000003), weight: 123},
			// Sutherland - Sutherland NSW 2232, Australia
			{location: new google.maps.LatLng(-34.03314,151.05830000000003), weight: 107},
			// Central Coast - Central Coast NSW, Australia
			{location: new google.maps.LatLng(-33.3529519,151.44354739999994), weight: 128},
			// Greater Sydney - Sydney Metropolitan Area, NSW, Australia
			{location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 2219},
			];

			var motherOverDate = [
			// Inner West - Inner West, NSW, Australia
			{location: new google.maps.LatLng(-33.8584827,151.12866859999997), weight: 129},
			// Albury - Albury NSW 2640, Australia
			{location: new google.maps.LatLng(-36.0737293,146.91354179999996), weight: 15},
			// Ryde - Ryde NSW 2112, Australia
			{location: new google.maps.LatLng(-33.81527799999999,151.10111099999995), weight: 53},
			// Baulkham Hills & Hawkesbury - Baulkham Hills NSW 2153, Australia
			{location: new google.maps.LatLng(-33.76288,150.99212), weight: 127},
			// Blacktown - Blacktown NSW 2148, Australia
			{location: new google.maps.LatLng(-33.771,150.9063), weight: 151},
			// City & Inner South - Sydney NSW 2000, Australia
			{location: new google.maps.LatLng(-33.8688197,151.20929550000005), weight: 106},
			// North Sydney & Hornsby - North Sydney NSW 2060, Australia
			{location: new google.maps.LatLng(-33.83965,151.20541000000003), weight: 173},
			// Northern Beaches - Northern Beaches, NSW, Australia
			{location: new google.maps.LatLng(-33.68919759999999,151.26853819999997), weight: 60},
			// Outer Southwest - Sydney Southwest Private Hospital - 40 Bigge St, Liverpool NSW 2170, Australia
			{location: new google.maps.LatLng(-33.91735159999999,150.9283736), weight: 83},
			// Outer West Blue Mountains - Blue Mountains, New South Wales, Australia
			{location: new google.maps.LatLng(-33.49999729999999,150.2499997), weight: 98},
			// Parramatta - Parramatta NSW 2150, Australia
			{location: new google.maps.LatLng(-33.81499999999999,151.00111100000004), weight: 145},
			// South West - Elizabeth Hills NSW 2171, Australia
			{location: new google.maps.LatLng(-33.90006659999999,150.84785220000003), weight: 98},
			// Sutherland - Sutherland NSW 2232, Australia
			{location: new google.maps.LatLng(-34.03314,151.05830000000003), weight: 59},
			// Central Coast - Central Coast NSW, Australia
			{location: new google.maps.LatLng(-33.3529519,151.44354739999994), weight: 95},
			// Greater Sydney - Sydney Metropolitan Area, NSW, Australia
			{location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 1681},
			];

			var bothAusData = [
			// Inner West - Inner West, NSW, Australia
			{location: new google.maps.LatLng(-33.8584827,151.12866859999997), weight: 68},
			// Albury - Albury NSW 2640, Australia
			{location: new google.maps.LatLng(-36.0737293,146.91354179999996), weight: 13},
			// Ryde - Ryde NSW 2112, Australia
			{location: new google.maps.LatLng(-33.81527799999999,151.10111099999995), weight: 45},
			// Baulkham Hills & Hawkesbury - Baulkham Hills NSW 2153, Australia
			{location: new google.maps.LatLng(-33.76288,150.99212), weight: 66},
			// Blacktown - Blacktown NSW 2148, Australia
			{location: new google.maps.LatLng(-33.771,150.9063), weight: 99},
			// City & Inner South - Sydney NSW 2000, Australia
			{location: new google.maps.LatLng(-33.8688197,151.20929550000005), weight: 62},
			// North Sydney & Hornsby - North Sydney NSW 2060, Australia
			{location: new google.maps.LatLng(-33.83965,151.20541000000003), weight: 116},
			// Northern Beaches - Northern Beaches, NSW, Australia
			{location: new google.maps.LatLng(-33.68919759999999,151.26853819999997), weight: 65},		
			// Outer Southwest - Sydney Southwest Private Hospital - 40 Bigge St, Liverpool NSW 2170, Australia
			{location: new google.maps.LatLng(-33.91735159999999,150.9283736), weight: 69},
			// Outer West Blue Mountains - Blue Mountains, New South Wales, Australia
			{location: new google.maps.LatLng(-33.49999729999999,150.2499997), weight: 96},
			// Parramatta - Parramatta NSW 2150, Australia
			{location: new google.maps.LatLng(-33.81499999999999,151.00111100000004), weight: 84},
			// South West - Elizabeth Hills NSW 2171, Australia
			{location: new google.maps.LatLng(-33.90006659999999,150.84785220000003), weight: 43},
			// Sutherland - Sutherland NSW 2232, Australia
			{location: new google.maps.LatLng(-34.03314,151.05830000000003), weight: 47},
			// Central Coast - Central Coast NSW, Australia
			{location: new google.maps.LatLng(-33.3529519,151.44354739999994), weight: 106},
			// Greater Sydney - Sydney Metropolitan Area, NSW, Australia
			{location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 1110},
			];

			var map = new google.maps.Map(mapCanvas, mapOptions);

			var heatmap = new google.maps.visualization.HeatmapLayer();
			var gradient = null;

			var radiusSlider = document.getElementById('radius-slider');
			var opacitySlider = document.getElementById('opacity-slider');

			noUiSlider.create(radiusSlider, {
				start: vm.radiusValue,
				connect: [true, false],
				step: 1,
				range: {
					'min': 0,
					'max': 200
				}
			});

			noUiSlider.create(opacitySlider, {
				start: vm.opacityValue,
				connect: [true, false],
				step: 0.01,
				range: {
					'min': 0,
					'max': 1
				}
			});

			radiusSlider.noUiSlider.on('change', function(value, handle, unencodedValue){
				vm.radiusValue = unencodedValue[handle];
				heatmap.set('radius', vm.radiusValue);
			});

			opacitySlider.noUiSlider.on('update', function(value, handle, unencodedValue){
				vm.opacityValue = unencodedValue[handle];
				heatmap.set('opacity', vm.opacityValue);
			});
			
			vm.updateMap = function(){
				if(heatmap){
					heatmap.setMap(null);
				}

				var heatmapData = []

				if(vm.bothOver){
					Array.prototype.push.apply(heatmapData, bothOverData);
				}
				if(vm.fatherOver){
					Array.prototype.push.apply(heatmapData, fatherOverDate);
				}
				if(vm.MotherOver){
					Array.prototype.push.apply(heatmapData, motherOverDate);
				}
				if(vm.bothAus){
					Array.prototype.push.apply(heatmapData, bothAusData);
				}

				heatmap.setData(heatmapData);
				heatmap.setOptions({
					radius :vm.radiusValue,
					opacity: vm.opacityValue,
					gradient: gradient
				});
				heatmap.setMap(map);
			}
			
			vm.removeGrtSyd = function(){
				if(vm.rmGrtSyd) {
					bothOverData.pop();
					fatherOverDate.pop();
					motherOverDate.pop();
					bothAusData.pop();
				} else {
					bothOverData.push({location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 121088});
					fatherOverDate.push({location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 2219});
					motherOverDate.push({location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 1681});
					bothAusData.push({location: new google.maps.LatLng(-33.88175470000001,150.8609358), weight: 1110});
				}
				vm.updateMap();
			}

			vm.changeGradient = function(){
				if(vm.changeGrad) {
					gradient = [
					'rgba(0, 255, 255, 0)',
					'rgba(0, 255, 255, 1)',
					'rgba(0, 191, 255, 1)',
					'rgba(0, 127, 255, 1)',
					'rgba(0, 63, 255, 1)',
					'rgba(0, 0, 255, 1)',
					'rgba(0, 0, 223, 1)',
					'rgba(0, 0, 191, 1)',
					'rgba(0, 0, 159, 1)',
					'rgba(0, 0, 127, 1)',
					'rgba(63, 0, 91, 1)',
					'rgba(127, 0, 63, 1)',
					'rgba(191, 0, 31, 1)',
					'rgba(255, 0, 0, 1)'
					]
				} else {
					gradient = null;
				}
				vm.updateMap();	
			}

			vm.updateMap();	

		}
	}


})();