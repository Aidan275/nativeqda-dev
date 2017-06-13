(function () {
	
	angular.module('nativeQDAApp', ['ngRoute', 'ngSanitize', 'ngTable', 'ui.bootstrap', 'ui.bootstrap.datepicker', 'rzModule', 'ngFileUpload', 'ngTagsInput']);

	config.$inject = ['$routeProvider', '$locationProvider'];
	function config ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/login', {
			templateUrl: '/pages/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/register', {
			templateUrl: '/pages/auth/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/forgot-password', {
			templateUrl: '/pages/auth/forgotPass/forgotPass.view.html',
			controller: 'forgotPassCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/', {
			templateUrl: '/pages/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/map', {
			templateUrl: '/pages/analysis/map/map.view.html',
			controller: 'mapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/data', {
			templateUrl: '/pages/analysis/data/data.view.html',
			controller: 'dataCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/visualisation', {
			templateUrl: '/pages/analysis/visualisation/visualisation.view.html',
			controller: 'visualisationCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/survey', {
			templateUrl: '/pages/survey/survey.view.html',
			controller: 'surveyCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/files', {
			templateUrl: '/pages/files/files.view.html',
			controller: 'filesCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/settings', {
			templateUrl: '/pages/settings/settings.view.html',
			controller: 'settingsCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/complete-survey', {
			templateUrl: '/pages/survey/completeSurvey/completeSurvey.view.html',
			controller: 'CompleteSurveyCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/heatmap-example', {
			templateUrl: '/pages/heatmapExample/heatmapExample.view.html',
			controller: 'heatmapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.otherwise({redirectTo: '/'});

	    // use the HTML5 History API
	    $locationProvider.html5Mode(true);
	}

	// hacked together for the complete survey page, will need to improve
	function run ($rootScope, $location, authentication) {
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
	}

	angular
	.module('nativeQDAApp')
	.config(['$routeProvider', '$locationProvider', config])
	.run(['$rootScope', '$location', 'authentication', run]);

})();