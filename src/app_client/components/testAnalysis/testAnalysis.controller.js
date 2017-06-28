(function () {

	angular
	.module('nativeQDAApp')
	.controller('testAnalysisCtrl', testAnalysisCtrl);

	testAnalysisCtrl.$inject = ['analysisService', '$scope'];
	function testAnalysisCtrl (analysisService, $scope) {
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
			strapline: 'using AYLIEN-TextAPI'
		};

		///////////////////////////

		function onSubmit() {
			analysisService.conceptAnalysis({text: vm.analysisText, language: vm.selectedLanguage.value})
			.then(function(response) {
				vm.responseData = response.data;
				console.log(response);
			});
		}
	}

})();
