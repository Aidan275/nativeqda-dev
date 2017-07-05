(function () {

	angular
	.module('nativeQDAApp')
	.controller('testAylienCtrl', testAylienCtrl);

	testAylienCtrl.$inject = ['analysisService', '$scope'];
	function testAylienCtrl (analysisService, $scope) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.selectedLanguage = null;
		vm.language = [
			{ language: 'English', value: 'en' },
			{ language: 'German', value: 'de' },
			{ language: 'French', value: 'fr' },
			{ language: 'Italian', value: 'it' },
			{ language: 'Spanish', value: 'es' },
			{ language: 'Portuguese', value: 'pt' }
		];
		vm.responseData = null;

		// Bindable Data
		vm.pageHeader = {
			title: 'Test Analysis',
			strapline: 'Using AYLIEN-TextAPI'
		};

		///////////////////////////

		function onSubmit() {
			analysisService.aylienConceptAnalysis({text: vm.analysisText, language: vm.selectedLanguage.value})
			.then(function(response) {
				vm.responseData = response.data;
				console.log(response);
			});
		}
	}

})();
