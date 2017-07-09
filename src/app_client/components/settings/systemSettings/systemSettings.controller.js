(function () { 

	angular
	.module('nativeQDAApp')
	.controller('systemSettingsCtrl', systemSettingsCtrl);
	
	function systemSettingsCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'System Settings',
			strapline: 'change how things work'
		};


	}


})();