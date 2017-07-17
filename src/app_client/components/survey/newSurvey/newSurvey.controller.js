(function () {

	angular
	.module('nativeQDAApp')
	.controller('newSurveyCtrl', newSurveyCtrl);

	/* @ngInject */
	function newSurveyCtrl () {
		var vm = this;

		var editorOptions = {
			// show the embeded survey tab. It is hidden by default
			showEmbededSurveyTab : false,
			// hide the test survey tab. It is shown by default
			showTestSurveyTab : true,
			// hide the JSON text editor tab. It is shown by default
			showJSONEditorTab : false,
			// show the "Options" button menu. It is hidden by default 
			showOptions: false                          
		};

		// pass the editorOptions into the constructor. It is an optional parameter.
		var survey = new SurveyEditor.SurveyEditor("surveyEditorContainer", editorOptions);

		//set function on save callback
		survey.saveSurveyFunc = saveMySurvey;

		function saveMySurvey(){
			var yourNewSurveyJSON = survey.text;
			alert(yourNewSurveyJSON);
		}



	}

})();