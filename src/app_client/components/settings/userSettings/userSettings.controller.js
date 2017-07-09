(function () { 

	angular
	.module('nativeQDAApp')
	.controller('userSettingsCtrl', userSettingsCtrl);
	
	/* @ngInject */
	function userSettingsCtrl ($scope, $window, NgTableParams, $sce, $uibModal) {
		var vm = this;

		vm.pageHeader = {
			title: 'User Management',
			strapline: 'manage users of the system'
		};
		
	var dataset = [
	{ firstName: 'Anu', lastName: 'Anu', email: 'anu@uow.edu.au', role: 'Researcher', command: 'id1'},
	{ firstName: 'Michael', lastName: 'Matthias', email: 'matthias@uow.edu.au', role: 'Researcher', command: 'id1'},
	{ firstName: 'Holly', lastName: 'Tootell', email: 'holly@uow.edu.au', role: 'Researcher', command: 'id1'},
	{ firstName: 'Aidan', lastName: 'Andrews', email: 'aidan@nativeqda.xyz', role: 'Bubble Admin', command: 'id1'},
	{ firstName: 'Ben', lastName: 'Rogers', email: 'ben@nativeqda.xyz', role: 'Bubble Admin', command: 'id1'},
	{ firstName: 'Guy', lastName: 'Corrigan', email: 'guy@nativeqda.xyz', role: 'Bubble Admin', command: 'id1'},
	{ firstName: 'Reece', lastName: 'Denaro', email: 'reece@nativeqda.xyz', role: 'Bubble Admin', command: 'id1'},
	{ firstName: 'Lucas', lastName: 'Weneger', email: 'lucas@nativeqda.xyz', role: 'Bubble Admin', command: 'id1'},
	];

	vm.tableParams = new NgTableParams({}, { dataset: dataset});

	$scope.confirmDelete = function () {
	$window.confirm("Are ya sure?")
	};
	
	}
	
	
	
	

})();