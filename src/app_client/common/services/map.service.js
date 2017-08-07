(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('mapService', mapService);

	/* @ngInject */
	function mapService ($http, authentication, exception) {
		return {
			putLink 	: putLink,
			getLinks	: getLinks
		};

		///////////////////////////

		function putLink(link){
			return $http.put('/api/map/link/', link, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(putLinkComplete)
			.catch(putLinkFailed);

			function putLinkComplete(data) { return data; }
			function putLinkFailed(e) { return exception.catcher('Failed saving the marker link.')(e); }
		};

		function getLinks(){
			return $http.get('/api/map/link/', {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(getLinksComplete)
			.catch(getLinksFailed);

			function getLinksComplete(data) { return data; }
			function getLinksFailed(e) { return exception.catcher('Failed gettings the marker links.')(e); }
		};
	}

})();