(function () { 

	angular
	.module('nativeQDAApp')
	.directive('initBind', initBind);

	initBind.$inject = ['$compile'];
	function initBind ($compile) {
		return {
			restrict: 'A',
			link : function (scope, element, attr) {
				attr.$observe('ngBindHtml',function(){
					if(attr.ngBindHtml){
						$compile(element[0].children)(scope);
					}
				})
			}
		};
	}

})();