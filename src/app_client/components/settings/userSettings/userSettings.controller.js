(function () { 

	angular
	.module('nativeQDAApp')
	.controller('userSettingsCtrl', userSettingsCtrl);
	
	function userSettingsCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Settings',
			strapline: 'change how things work'
		};


	}


})();