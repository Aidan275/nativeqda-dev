(function () { 

	angular
	.module('nativeQDAApp')
	.controller('systemSettingsCtrl', systemSettingsCtrl);
	
	function systemSettingsCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Settings',
			strapline: 'change how things work'
		};


	}


})();