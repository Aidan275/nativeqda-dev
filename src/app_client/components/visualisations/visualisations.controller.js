(function () {

	angular
	.module('visualisations')
	.controller('visualisationsCtrl', visualisationsCtrl);

	/* @ngInject */
	function visualisationsCtrl ($routeParams, $window, analysisService, s3Service, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.viewFile = viewFile;
		vm.toggleOptions = toggleOptions;
		vm.togglePage = togglePage;
		vm.pageId = 'visualisations-index';

		// Bindable Data
		vm.analysisId = $routeParams.id;
		vm.analysisData = {};
		vm.pageHeader = {
			title: 'Visualisations',
			strapline: 'Use the side menu on the left to see available visualisations'
		};
		vm.details = true;
		vm.upAndComing = false;
		vm.categories = false;
		vm.concepts = false;
		vm.entities = false;
		vm.keywords = false;
		vm.relations = false;
		vm.semanticRoles = false;
		
		/* Slideout side menu initialisation */
		var slideout = new Slideout({
			'panel': document.querySelector('#viPanel'),
			'menu': document.querySelector('#viMenu'),
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
				vm.upAndComing = false;
				vm.categories = false;
				vm.concepts = false;
				vm.entities = false;
				vm.keywords = false;
				vm.relations = false;
				vm.semanticRoles = false;

			switch(page) {
				case 'details':
				vm.details = true;
				break;
				case 'categories':
				vm.details = true;
				vm.categories = true;
				vm.upAndComing = true;
				break;
				case 'concepts':
				vm.details = true;
				vm.concepts = true;
				vm.upAndComing = true;
				break;
				case 'entites':
				vm.details = true;
				vm.entities = true;
				vm.upAndComing = true;
				break;
				case 'keywords':
				vm.details = true;
				vm.keywords = true;
				vm.upAndComing = true;
				break;
				case 'relations':
				vm.details = true;
				vm.relations = true;
				vm.upAndComing = true;
				break;
				case 'semanticRoles':
				vm.details = true;
				vm.semanticRoles = true;
				vm.upAndComing = true;
				break;
				default:
				vm.details = true;
			}
		}

		function activate() {
			getAnalysisData();
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
				//Browser is mobile based
			}
			else{
				// slideout.toggle(); Browser is desktop based
			}
	
			
		}

		function getAnalysisData() {
			bsLoadingOverlayService.start({referenceId: 'visuals-info'});
			analysisService.readWatsonAnalysis(vm.analysisId)
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
