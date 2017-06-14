(function () { 

    angular
    .module('nativeQDAApp')
    .directive('dynamicCompile', dynamicCompile);

    dynamicCompile.$inject = ['$compile'];
    function dynamicCompile ($compile) {
        var directive = {
            link: link,
            restrict: 'A',
            replace: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.$watch(attrs.dynamicCompile, function(html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        };
    }

})();