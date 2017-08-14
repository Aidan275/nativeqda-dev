(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.service('s3Service', s3Service);

	/* @ngInject */
	function s3Service ($http, authentication, exception) {
		return {
			signDownloadKey	: signDownloadKey
		};

		///////////////////////////

		function signDownloadKey(key){
			return $http.get('/api/s3/signDownload/' + key, {
				headers: {
					Authorization: 'Bearer ' + authentication.getToken()
				}
			}).then(signDownloadKeyComplete)
			.catch(signDownloadKeyFailed);

			function signDownloadKeyComplete(data) { return data; }
			function signDownloadKeyFailed(e) { return exception.catcher('Failed signing the S3 download URL.')(e); }
		};
	}

})();