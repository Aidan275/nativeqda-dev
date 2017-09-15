(function () {
	angular
	.module('common.directives')
	.directive('pwCheck', pwCheck);

	// Directive to check if password match
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