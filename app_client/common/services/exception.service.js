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

				// if message parameter passed, add a new line to the end of the message
				if (message) 
					message += '\n';

				if (err.data && err.data.description) {
					newMessage = message + err.data.description;
					err.data.description = newMessage;
				} else if (err.data && err.data.message){	 // For S3 errors with err.data.message
					newMessage = message + err.data.message;
					err.data.message = newMessage;
				}

				logger.error(newMessage, err, 'Error');
				return $q.reject(err);
			};
		}
	}
})();