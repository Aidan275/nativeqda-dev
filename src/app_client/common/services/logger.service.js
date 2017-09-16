/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc service
* @name services.service:logger
* @description Service used to log error, info, success, and warning messages to the console and to
* display messages, in the form of toasts, to the users.
*/

(function() {
    'use strict';

    angular
    .module('services')
    .service('logger', logger);

    /* @ngInject */
    function logger($log) {
        return {
            showToasts: true,

            error   : error,
            info    : info,
            success : success,
            warning : warning,

            // straight to console; bypass toastr
            log     : $log.log
        };

        ///////////////////////////

        function error(message, data, title) {
            toastr.error(message, title);
            $log.error('Error: ' + message, data);
        }

        function info(message, data, title) {
            toastr.info(message, title);
            $log.info('Info: ' + message, data);
        }

        function success(message, data, title) {
            toastr.success(message, title);
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            toastr.warning(message, title);
            $log.warn('Warning: ' + message, data);
        }
    }
}());