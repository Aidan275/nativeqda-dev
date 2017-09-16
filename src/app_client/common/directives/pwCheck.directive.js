/**
* @author Aidan Andrews <aa275@uowmail.edu.au>
* @ngdoc directive 
* @name directives.directive:pwCheck
* @description Directive to check if password and confirm password match.
*/

(function () {
	angular
	.module('directives')
	.directive('pwCheck', pwCheck);

	function pwCheck () {
		return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                $(elem).add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('pwcheck', v);
                    });
                });
            }
        }
	}
})();