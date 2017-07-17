(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('surveyCtrl', surveyCtrl);

	/* @ngInject */
	function surveyCtrl ($scope, $window, NgTableParams, $sce, $uibModal) {
		var vm = this;

		vm.pageHeader = {
			title: 'Surveys',
			strapline: 'for the masses'
		};

		var dataset = [
		{ survey: 'Survey', createdBy: 'Anu', responses: 12, dateCreated: '2017/05/26', command: 'id1'},
		{ survey: 'Survey2', createdBy: 'Michael', responses: 50, dateCreated: '2017/05/02', command: 'id1'},
		{ survey: 'Survey3', createdBy: 'Michael', responses: 23, dateCreated: '2017/02/12', command: 'id1'},
		{ survey: 'Survey4', createdBy: 'Anu', responses: 50, dateCreated: '2017/02/15', command: 'id1'},
		{ survey: 'Survey5', createdBy: 'Holly', responses: 11, dateCreated: '2017/04/02', command: 'id1'},
		{ survey: 'Survey6', createdBy: 'Anu', responses: 1, dateCreated: '2017/01/11', command: 'id1'},
		{ survey: 'Survey7', createdBy: 'Michael', responses: 100, dateCreated: '2017/01/23', command: 'id1'},
		];

		vm.tableParams = new NgTableParams({}, { dataset: dataset});

		$scope.confirmDelete = function () {
			$window.confirm("Are ya sure?")
		};

	}

})();
