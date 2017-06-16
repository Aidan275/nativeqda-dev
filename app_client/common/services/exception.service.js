(function() {
	'use strict';

	angular
	.module('nativeQDAApp')
	.service('exception', exception);

	exception.$inject = ['$q', 'logger'];
	function exception($q, logger) {
		return {
			catcher: catcher
		};

		///////////////////////////

		function catcher(message) {
			return function(err) {
				var thrownDescription;
				var newMessage;
				if (err.data && err.data.description) {
					thrownDescription = '\n' + err.data.description;
					newMessage = message + thrownDescription;
					err.data.description = newMessage;
				} else if (err.data && err.data.message){	 // For S3 errors with err.data.message
					thrownDescription = '\n' + err.data.message;
					newMessage = message + thrownDescription;
					err.data.message = newMessage;
				}
				logger.error(newMessage, err, 'Error');
				return $q.reject(err);
			};
		}
	}
})();