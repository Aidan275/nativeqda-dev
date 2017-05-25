(function () { 

	angular
	.module('nativeQDAApp')
	.controller('homeCtrl', homeCtrl);
	
	function homeCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Dashboard',
			strapline: 'summary of recent activity'
		};
	}

})();