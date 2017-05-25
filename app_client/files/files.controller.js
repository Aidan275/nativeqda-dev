(function () { 

	angular
	.module('nativeQDAApp')
	.controller('filesCtrl', filesCtrl);
	
	function filesCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Files',
			strapline: 'explore folders for files'
		};


	}


})();