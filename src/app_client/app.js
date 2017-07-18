(function () {
	
	angular.module('nativeQDAApp', ['ngRoute', 'ngSanitize', 'ngTable', 'ui.bootstrap', 'ui.bootstrap.datepicker', 'ngFileUpload', 'ngTagsInput', 'jp.ng-bs-animated-button', 'bsLoadingOverlay', 'color.picker']);

	/* @ngInject */
	function config ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/login', {
			title: 'NativeQDA | Login',
			templateUrl: '/components/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/register', {
			title: 'NativeQDA | Register',
			templateUrl: '/components/auth/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/forgot-password', {
			title: 'NativeQDA | Forgot Password',
			templateUrl: '/components/auth/forgotPass/forgotPass.view.html',
			controller: 'forgotPassCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/', {
			title: 'NativeQDA | Home',
			templateUrl: '/components/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis', {
			title: 'NativeQDA | Analysis',
			templateUrl: '/components/analysis/analysis.view.html',
			controller: 'analysisCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/visualisations/:id', {
			title: 'NativeQDA | Visualisations',
			templateUrl: '/components/visualisations/visualisations.view.html',
			controller: 'visualisationsCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/map', {
			title: 'NativeQDA | Map',
			templateUrl: '/components/map/map.view.html',
			controller: 'mapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/survey', {
			title: 'NativeQDA | Surveys',
			templateUrl: '/components/survey/survey.view.html',
			controller: 'surveyCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/survey/new', {
			title: 'NativeQDA | Create Survey',
			templateUrl: '/components/survey/newSurvey/newSurvey.view.html',
			controller: 'newSurveyCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/files/upload', {
			title: 'NativeQDA | Upload File',
			templateUrl: '/components/files/filesUpload/filesUpload.view.html',
			controller: 'filesUploadCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/files/browse', {
			title: 'NativeQDA | File Browser',
			templateUrl: '/components/files/filesBrowse/filesBrowse.view.html',
			controller: 'filesBrowseCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/files/datasets', {
			title: 'NativeQDA | Datasets',
			templateUrl: '/components/files/datasets/datasets.view.html',
			controller: 'datasetsCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/settings/system-settings', {
			title: 'NativeQDA | System Settings',
			templateUrl: '/components/settings/systemSettings/systemSettings.view.html',
			controller: 'systemSettingsCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/settings/user-management', {
			title: 'NativeQDA | User Management',
			templateUrl: '/components/settings/userManagement/userManagement.view.html',
			controller: 'userManagementCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/complete-survey', {
			title: 'NativeQDA | Survey',
			templateUrl: '/components/survey/completeSurvey/completeSurvey.view.html',
			controller: 'CompleteSurveyCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/bubble-chart/:type/:id', {
			title: 'NativeQDA | Bubble Chart',
			templateUrl: '/components/visualisations/visuals/bubbleChart/bubbleChart.view.html',
			controller: 'bubbleChartCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/radar-chart/:type/:id', {
			title: 'NativeQDA | Radar Chart',
			templateUrl: '/components/visualisations/visuals/radarChart/radarChart.view.html',
			controller: 'radarChartCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/treemap-chart/:type/:id', {
			title: 'NativeQDA | Treemap Chart',
			templateUrl: '/components/visualisations/visuals/treemapChart/treemapChart.view.html',
			controller: 'treemapChartCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/basic-table/:type/:id', {
			title: 'NativeQDA | Basic Table',
			templateUrl: '/components/visualisations/visuals/basicTable/basicTable.view.html',
			controller: 'basicTableCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/bar-chart/:type/:id', {
			title: 'NativeQDA | Bar Chart',
			templateUrl: '/components/visualisations/visuals/barChart/barChart.view.html',
			controller: 'barChartCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/heatmap-example', {
			title: 'NativeQDA | Heatmap Example',
			templateUrl: '/components/heatmapExample/heatmapExample.view.html',
			controller: 'heatmapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/test-analysis/aylien', {
			title: 'NativeQDA | Test Analysis - AYLIEN',
			templateUrl: '/components/testAnalysis/aylien/testAylien.view.html',
			controller: 'testAylienCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/test-analysis/watson', {
			title: 'NativeQDA | Test Analysis - Watson',
			templateUrl: '/components/testAnalysis/watson/testWatson.view.html',
			controller: 'testWatsonCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.otherwise({redirectTo: '/'});

	    // use the HTML5 History API
	    $locationProvider.html5Mode(true);
	}

	function run ($rootScope, $location, authentication, bsLoadingOverlayService) {
		$rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
			var postLogInRoute;
			if(nextRoute.loginRequired && !authentication.isLoggedIn()){
				postLogInRoute = $location.path();
				$location.path('/login').replace();
				$location.search('page', postLogInRoute);
			} else if (nextRoute.loginRequired && authentication.isLoggedIn()) {
				$location.path(postLogInRoute).replace();
				postLogInRoute = null;
			} 
		});

		// Sets the title of each page - gets the title string from the routeProvider above
		// If no title string provided, sets the title to 'NativeQDA'
		$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
			if(current.$$route.title) {
				$rootScope.title = current.$$route.title;
			} else {
				$rootScope.title = 'NativeQDA';
			}
		});

		// angular loading overlay config - should try put into the config.js file instead 
		bsLoadingOverlayService.setGlobalConfig({
			templateUrl: '/common/views/loadingOverlayTemplate4.html', // Template url for overlay element. If not specified - no overlay element is created.
			delay: 300, // Minimal delay to hide loading overlay in ms.
		});
	}

	angular
	.module('nativeQDAApp')
	.config(['$routeProvider', '$locationProvider', config])
	.run(['$rootScope', '$location', 'authentication', 'bsLoadingOverlayService', run]);

})();