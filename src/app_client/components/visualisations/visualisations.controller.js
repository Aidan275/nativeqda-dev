(function () {

	angular
	.module('nativeQDAApp')
	.controller('visualisationsCtrl', visualisationsCtrl);

	/* @ngInject */
	function visualisationsCtrl ($routeParams, $window, analysisService, s3Service, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.viewFile = viewFile;
		vm.toggleOptions = toggleOptions;
		vm.togglePage = togglePage;
		vm.pageId = 'visualisations';

		// Bindable Data
		vm.analysisID = $routeParams.id;
		vm.analysisData = {};
		vm.pageHeader = {
			title: 'Visualisations'
		};
		vm.details = true;
		vm.categories = false;
		vm.concepts = false;
		vm.entities = false;
		vm.keywords = false;
		vm.relations = false;
		vm.semantic-roles = false;
		
		/* Slideout side menu initialisation */
		var slideout = new Slideout({
			'panel': document.querySelector('#panel'),
			'menu': document.querySelector('#menu'),
			'padding': 256,
			'tolerance': 70
		});

		activate();

		///////////////////////////
		
		function toggleOptions() {
			slideout.toggle();
		}

		/* Clicking the page button gives this function the page string which then hides all the pages and uses */
		/* a switch statement to show the selected page - could probably be done better but it's simple and works */
		function togglePage(page) {
				vm.details = false;
				vm.categories = false;
				vm.concepts = false;
				vm.entities = false;
				vm.keywords = false;
				vm.relations = false;
				vm.semantic-roles = false;

			switch(page) {
				case 'details':
				vm.details = true;
				break;
				case 'categories':
				vm.details = true;
				vm.categories = true;
				break;
				case 'concepts':
				vm.details = true;
				vm.concepts = true;
				break;
				case 'entites':
				vm.details = true;
				vm.entites = true;
				break;
				case 'keywords':
				vm.details = true;
				vm.keywords = true;
				break;
				case 'relations':
				vm.details = true;
				vm.relations = true;
				break;
				case 'semantic-roles':
				vm.details = true;
				vm.semantic-roles = true;
				break;
				default:
				vm.details = true;
			}
		}

		function activate() {
			getAnalysisData();
		}

		function getAnalysisData() {
			bsLoadingOverlayService.start({referenceId: 'visuals-info'});
			analysisService.readWatsonAnalysis(vm.analysisID)
			.then(function(response) {
				bsLoadingOverlayService.stop({referenceId: 'visuals-info'});
				vm.analysisData = response.data;
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			s3Service.signDownloadKey(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

	}

})();
