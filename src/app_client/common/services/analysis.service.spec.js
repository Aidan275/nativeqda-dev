describe('analysisService', function() {
	var scope;
	var mocks = {};

	beforeEach(function () {
		module('services', function($provide) {
			specHelper.fakeRouteProvider($provide);
			specHelper.fakeLogger($provide);
		});
		specHelper.injector(function($httpBackend, $rootScope, analysisService) {});            

		mocks.mockListWatsonAnalysis = mockData.mockListWatsonAnalysis();
		mocks.readWatsonAnalysis = mockData.readWatsonAnalysis();

	});

	it('should be registered', function() {
		expect(analysisService).to.be.defined;
	});

	describe('watsonTextAnalysis function', function () {
		it('should exist', function () {
			expect(analysisService.watsonTextAnalysis).to.be.defined;
		});
	});

	describe('readWatsonAnalysis function', function () {
		it('should exist', function () {
			expect(analysisService.readWatsonAnalysis).to.be.defined;
		});
		
		it('should return an object', function (done) {
			$httpBackend.when('GET', '/api/analysis/watson/read?id=59679c9c5aa3e61e6452d380').respond(200, mocks.readWatsonAnalysis);
			analysisService.readWatsonAnalysis('59679c9c5aa3e61e6452d380').then(function(data) {
				expect(data).to.be.an('object');
				done();
			});
			$rootScope.$apply();
			$httpBackend.flush();
		});

		it("The first concept should be 'Astroid'", function (done) {
			$httpBackend.when('GET', '/api/analysis/watson/read?id=59679c9c5aa3e61e6452d380').respond(200, mocks.readWatsonAnalysis);
			analysisService.readWatsonAnalysis('59679c9c5aa3e61e6452d380').then(function(data) {
				expect(data.concepts[0].text).to.equal("Asteroid");
				done();
			});
			$rootScope.$apply();
			$httpBackend.flush();
		});
		
	});

	specHelper.verifyNoOutstandingHttpRequests();
});