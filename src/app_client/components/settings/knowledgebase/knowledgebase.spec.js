describe('knowledgebaseCtrl', function() {
	var knowledgebaseCtrl;

	beforeEach(module('settings'))

	beforeEach(function() {
		/* HTML required by the Slideout side bar */
		var slideOutHTML = '<div id="kbMenu"></div><div id="kbPanel"></div>';
		document.body.insertAdjacentHTML('afterbegin', slideOutHTML);
	});

	beforeEach(inject(function ($controller) {
		knowledgebaseCtrl = $controller('knowledgebaseCtrl');
	}));
	
	it('should be created successfully', function () {
		expect(knowledgebaseCtrl).to.be.defined;
	});

	describe('toggleOptions()', function(){
		it('should toggle the slideout sidebar', function() {
			knowledgebaseCtrl.toggleOptions().should.equal(true);
		});
	});

});