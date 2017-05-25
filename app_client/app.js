(function () {

	angular.module('nativeQDAApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngTable']);

	config.$inject = ['$routeProvider', '$locationProvider'];
	function config ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/', {
			templateUrl: '/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm'
		})
		.when('/about', {
			templateUrl: '/common/views/genericText.view.html',
			controller: 'aboutCtrl',
			controllerAs: 'vm'
		})
		.when('/location/:locationid', {
			templateUrl: '/locationDetail/locationDetail.view.html',
			controller: 'locationDetailCtrl',
			controllerAs: 'vm'
		})
		.when('/register', {
			templateUrl: '/auth/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm'
		})
		.when('/login', {
			templateUrl: '/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm'
		})
		.when('/complete-survey', {
			templateUrl: '/survey/completeSurvey/completeSurvey.view.html',
			controller: 'CompleteSurveyCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/map', {
			templateUrl: '/analysis/map/analysisMapDetail.view.html',
			controller: 'mapCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/data', {
			templateUrl: '/analysis/data/analysisDataDetail.view.html',
			controller: 'analysisDataCtrl',
			controllerAs: 'vm'
		})
		.when('/analysis/visualisation', {
			templateUrl: '/analysis/visualisation/analysisVisualisationDetail.view.html',
			controller: 'analysisVisCtrl',
			controllerAs: 'vm'
		})
		.otherwise({redirectTo: '/'});

	    // use the HTML5 History API
	    $locationProvider.html5Mode(true);
	}

	// hacked together for the complete survey page, will need to improve
	function run ($rootScope, $location, authentication) {
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
			if(next.$$route.templateUrl == '/survey/completeSurvey/completeSurvey.view.html'){
				$location.path("/complete-survey");
			} else if (!authentication.isLoggedIn()) {
				$location.path("/login");
			} 
		});
	}


	angular
	.module('nativeQDAApp')
	.config(['$routeProvider', '$locationProvider', config])
	.run(['$rootScope', '$location', 'authentication', run]);

})();