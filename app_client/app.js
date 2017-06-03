(function () {
	
	angular.module('nativeQDAApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngTable']);

	config.$inject = ['$routeProvider', '$locationProvider'];
	function config ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/login', {
			templateUrl: '/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm'
		})
		.when('/register', {
			templateUrl: '/auth/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm'
		})
		.when('/forgot-password', {
			templateUrl: '/auth/forgotPass/forgotPass.view.html',
			controller: 'forgotPassCtrl',
			controllerAs: 'vm'
		})
		.when('/', {
			templateUrl: '/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/map', {
			templateUrl: '/analysis/map/map.view.html',
			controller: 'mapCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/data', {
			templateUrl: '/analysis/data/data.view.html',
			controller: 'dataCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/visualisation', {
			templateUrl: '/analysis/visualisation/visualisation.view.html',
			controller: 'visualisationCtrl',
			controllerAs: 'vm'
		})
		.when('/survey', {
			templateUrl: '/survey/survey.view.html',
			controller: 'surveyCtrl',
			controllerAs: 'vm'
		})
		.when('/files', {
			templateUrl: '/files/files.view.html',
			controller: 'filesCtrl',
			controllerAs: 'vm'
		})
		.when('/settings', {
			templateUrl: '/settings/settings.view.html',
			controller: 'settingsCtrl',
			controllerAs: 'vm'
		})
		.when('/complete-survey', {
			templateUrl: '/survey/completeSurvey/completeSurvey.view.html',
			controller: 'CompleteSurveyCtrl',
			controllerAs: 'vm'
		})
		.otherwise({redirectTo: '/'});

	    // use the HTML5 History API
	    $locationProvider.html5Mode(true);
	}

	// hacked together for the complete survey page, will need to improve
	function run ($rootScope, $location, authentication) {
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
		
		});
	}

	angular
	.module('nativeQDAApp')
	.config(['$routeProvider', '$locationProvider', config])
	.run(['$rootScope', '$location', 'authentication', run]);

})();