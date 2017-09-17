describe('analysis module', function() {
	var controller;
	var analysisList = mockData.mockListWatsonAnalysis();


	beforeEach(function() {
		module('nativeQDA', function($provide) {
			specHelper.fakeRouteProvider($provide);
			specHelper.fakeLogger($provide);
		});
		specHelper.injector(function($controller, $q, $rootScope, analysisService) {});
	});

	beforeEach(function() {
		sinon.stub(analysisService, 'listWatsonAnalysis').returns($q.when(analysisList));
		controller = $controller('analysisCtrl');
		$rootScope.$apply();
	});

	specHelper.verifyNoOutstandingHttpRequests();

	describe('analysisCtrl', function() {

		it('should be created successfully', function () {
			expect(controller).to.be.defined;
		});

		describe('After activate', function () {
			it('should have called analysisService.listWatsonAnalysis 1 time', function () {
				expect(analysisService.listWatsonAnalysis).to.have.been.calledOnce;
			});

			it('should have vm.pageHeader title Analysis', function () {
				expect(controller.pageHeader.title).to.equal('Analysis');
			});

			it('Should have 2 analyses', function() {
				expect(controller.analyses).to.have.length(2);
			});
		});

	});





});