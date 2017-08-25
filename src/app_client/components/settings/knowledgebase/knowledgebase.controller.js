(function () { 

	angular
	.module('nativeQDAApp')
	.controller('knowledgebaseCtrl', knowledgebaseCtrl);
	
	function knowledgebaseCtrl() {
		var vm = this;

		/* Bindable Functions */
		vm.toggleOptions = toggleOptions;
		vm.togglePage = togglePage;

		/* Bindable Data */
		vm.knowledgebase = true;
		vm.terminology = false;
		vm.uploading = false;
		vm.datasets = false;
		vm.analysis = false;
		vm.visualisations = false;
		vm.map = false;
		vm.system = false;

		/* Slideout side menu initialisation */
		var slideout = new Slideout({
			'panel': document.querySelector('#kbPanel'),
			'menu': document.querySelector('#kbMenu'),
			'padding': 256,
			'tolerance': 70
		});

		///////////////////////////

		function toggleOptions() {
			slideout.toggle();
		}

		/* Clicking the page button gives this function the page string which then hides all the pages and uses */
		/* a switch statement to show the selected page - could probably be done better but it's simple and works */
		function togglePage(page) {
			vm.knowledgebase = false;
			vm.terminology = false;
			vm.uploading = false;
			vm.datasets = false;
			vm.analysis = false;
			vm.visualisations = false;
			vm.map = false;
			vm.system = false;

			switch(page) {
				case 'knowledgebase':
				vm.knowledgebase = true;
				break;
				case 'terminology':
				vm.terminology = true;
				break;
				case 'uploading':
				vm.uploading = true;
				break;
				case 'datasets':
				vm.datasets = true;
				break;
				case 'analysis':
				vm.analysis = true;
				break;
				case 'visualisations':
				vm.visualisations = true;
				break;
				case 'map':
				vm.map = true;
				break;
				case 'system':
				vm.system = true;
				break;
				default:
				vm.knowledgebase = true;
			}
		}
	}

})();
