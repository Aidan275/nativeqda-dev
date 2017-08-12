(function () { 

	angular
	.module('nativeQDAApp')
	.controller('knowledgebaseCtrl', knowledgebaseCtrl);
	
	function knowledgebaseCtrl () {
		var vm = this;

		vm.pageHeader = {
			title: 'Knowledgebase',
			strapline: 'learn how to use things'
		};


	}


})();