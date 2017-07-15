(function() {
	'use strict';

	angular
	.module('nativeQDAApp')
	.service('exception', exception);

	/* @ngInject */
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
				if (message) {
					message += '\n';
				}

				if (err.data && err.data.description) {
					newMessage = message + err.data.description;
					err.data.description = newMessage;
				} else if (err.data && err.data.message){	 // For S3 errors with err.data.message
					newMessage = message + err.data.message;
					err.data.message = newMessage;
				} else if (err.data && err.data.errmsg){	 // For DB errors with err.data.errmsg
					if(err.data.code === 11000) {			// if duplicate key error - must be existing email in DB 
						newMessage = message + 'Email already exists in the database';
					} else {
						newMessage = message + err.data.errmsg;
						err.data.errmsg = newMessage;
					}
				} else if (err.data && err.data.error){	 // For Watson errors with err.data.error
					newMessage = message + err.data.error;
					err.data.error = newMessage;
				}

				logger.error(newMessage, err, 'Error');
				return $q.reject(err);
			};
		}
	}
})();