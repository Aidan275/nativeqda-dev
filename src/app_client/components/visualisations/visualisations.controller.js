(function () {

	angular
	.module('visualisations')
	.controller('visualisationsCtrl', visualisationsCtrl);

	/* @ngInject */
	function visualisationsCtrl ($routeParams, $window, analysisService, s3Service, bsLoadingOverlayService, NgTableParams) {
		var vm = this;

		/* Scrolls to the top of the page */
		document.body.scrollTop = 0; /* For Chrome, Safari and Opera */ 
	    document.documentElement.scrollTop = 0; /* For IE and Firefox */

		// Bindable Functions
		vm.viewFile = viewFile;
		vm.toggleOptions = toggleOptions;
		vm.togglePage = togglePage;
		vm.pageId = 'visualisations-index';

		// Bindable Data
		vm.analysisId = $routeParams.id;
		vm.analysisData = {};
		vm.tableParams;

		vm.details = true;
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

		function activate() {
			getAnalysisData();
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
				//Browser is mobile based
			}
			else{
				//Browser is desktop based
			}			
		}

		function getAnalysisData() {
			bsLoadingOverlayService.start({referenceId: 'visuals-info'});
			analysisService.readWatsonAnalysis(vm.analysisId)
			.then(function(data) {
				bsLoadingOverlayService.stop({referenceId: 'visuals-info'});
				vm.analysisData = data;
				listData();
			});
		}


		function listData() {
			vm.tableParams = new NgTableParams({
				count: vm.analysisData.files.length, // hides pager
				sorting: {lastModified: "desc"}	/* For sorting by last modified date */
			}, {
				dataset: vm.analysisData.files,
				counts: [] // hides page sizes
			});
			bsLoadingOverlayService.stop({referenceId: 'visuals-info'});	/* Stop animated loading overlay */
		}
		
		/* Function for opening a selected file, the file varibale contains all the file information directly */
		/* from the table, the raw variable is a boolean that specifies if opening actual file or the text file */
		/* raw must be a true or false string */
		function viewFile(file, raw) {	
			/* Open a blank new tab while still in a trusted context to prevent a popup blocker warning */
			var newTab = $window.open("about:blank", '_blank')

			/* CSS and HTML for loading animation to display while fetching the signed URL */
			var loaderHTML = '<style>#loader{position: absolute;left: 50%;top: 50%;border:0.5em solid rgba(70, 118, 250, 0.2);border-radius:50%;'+
			'border-top:0.5em solid #4676fa;width:75px;height:75px;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite;}'+
			'@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);}100%{-webkit-transform:rotate(360deg);}}'+
			'@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'+
			'<div id="loader"></div>';

			/* Write the loading animation code to the new window */
			newTab.document.write(loaderHTML);

			/* Make a request to the server for a signed URL to download/view the requested file */
			s3Service.signDownload(file.path, file.name, raw)	/* raw variable flag to return the associated text file or the actual file */
			.then(function(data) {
				/* Remove the animation 1s after the signed URL is retrieved */
				setTimeout(function(){
					var loader = newTab.document.getElementById("loader");
					if(loader) {
						loader.remove();
					}
				},1000);

				/* Redirect the new tab to the signed URL */
				/* If raw text is true, view in browser. */
				if(raw === 'true') {
					newTab.location = data.url;
				} else {
					/* Else the file is a document and not the raw text so open in google docs viewer to view in the browser */
					var encodedUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(data.url) + '&embedded=true';
					newTab.location = encodedUrl;
				}

			}, function() {
				/* If there is an error, close the new tab */
				newTab.close();
			});

		}
		
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
			vm.semanticRoles = false;

			switch(page) {
				case 'details':
				vm.details = true;
				break;
				case 'categories':
				//vm.details = true;
				vm.categories = true;
				break;
				case 'concepts':
				//vm.details = true;
				vm.concepts = true;
				break;
				case 'entities':
				//vm.details = true;
				vm.entities = true;
				break;
				case 'keywords':
				//vm.details = true;
				vm.keywords = true;
				break;
				case 'relations':
				//	vm.details = true;
				vm.relations = true;
				break;
				case 'semanticRoles':
				//	vm.details = true;
				vm.semanticRoles = true;
				break;
				default:
				vm.details = true;
		}
	}


}

})();
