(function () { 

	angular
	.module('nativeQDAApp')
	.controller('settingsCtrl', settingsCtrl);
	
	function settingsCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Settings',
			strapline: 'change how things work'
		};


	}


})();