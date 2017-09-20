(function () {

	angular
	.module('visualisations')
	.controller('dataTableCtrl', dataTableCtrl);

	/* @ngInject */
	function dataTableCtrl ($routeParams, analysisService, NgTableParams, bsLoadingOverlayService) {
		var vm = this;

		var analysisType = $routeParams.type;
		var analysisId = $routeParams.id;
		var responseData = {};
		var tableData = [];
		vm.cols = [];

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'analysis-data-table'});
			analysisService.readWatsonAnalysis(analysisId)
			.then(function(data) {
				bsLoadingOverlayService.stop({referenceId: 'analysis-data-table'});
				responseData = data;
				switch (analysisType) {
					case 'categories':
					categoriesTable();
					break;
					case 'concepts':
					conceptsTable();
					break;
					case 'entities':
					entitiesTable();
					break;
					case 'keywords':
					keywordsTable();
					break;
					case 'relations':
					relationsTable();
					break;
					case 'semantic-roles':
					semanticRolesTable();
					break;
				}
			});
		}

		function categoriesTable() {
			bsLoadingOverlayService.start({referenceId: 'analysis-data-table'});
			analysisService.readWatsonCategories(analysisId)
			.then(function(data) {
				bsLoadingOverlayService.stop({referenceId: 'analysis-data-table'});
				responseData = data;

				var repeaterID = 0;
				responseData.categories.forEach(function(object) {
					object.label = object.label || {};	// If no object child, set object to empty (to prevent undefined error)
					object.score = object.score || {};

					var anObject = 	{
						id: repeaterID,
						label: object.label,
						score: object.score
					};
					tableData.push(anObject);
					repeaterID++;
				});

				vm.cols = [
				{field:"label", filter:{ label:"text" }, show:true, sortable:"label", title:"Label"},
				{field:"score", filter:{ score:"number" }, show:true, sortable:"score", title:"Score"}
				];

				vm.tableParams = new NgTableParams({}, { dataset: tableData });
			});
		}

		function conceptsTable() {
			var repeaterID = 0;
			responseData.concepts.forEach(function(object) {
				object.text = object.text || {};	// If no object child, set object to empty (to prevent undefined error)
				object.relevance = object.relevance || {};
				object.dbpedia_resource = object.dbpedia_resource || {};

				var anObject = 	{
					id: repeaterID,
					text: object.text,
					relevance: object.relevance,
					dbpedia_resource: object.dbpedia_resource
				};
				tableData.push(anObject);
				repeaterID++;
			});

			vm.cols = [
			{field:"text", filter:{ text:"text" }, show:true, sortable:"text", title:"Text"},
			{field:"relevance", filter:{ relevance:"number" }, show:true, sortable:"relevance", title:"Relevance"},
			{field:"dbpedia_resource", filter:{ dbpedia_resource:"number" }, show:true, sortable:"dbpedia_resource", title:"DBpedia Resource"}
			];

			vm.tableParams = new NgTableParams({}, { dataset: tableData });
		}

		function entitiesTable() {
			var repeaterID = 0;
			responseData.entities.forEach(function(object) {
				object.text = object.text || {};	// If no object child, set object to empty (to prevent undefined error)
				object.count = object.count || {};
				object.type = object.type || {};
				object.relevance = object.relevance || {};
				object.emotion = object.emotion || {};
				object.sentiment = object.sentiment || {};

				var anObject = 	{
					id: repeaterID,
					text: object.text,
					count: object.count,
					type: object.type,
					relevance: object.relevance,
					anger: object.emotion.anger,
					disgust: object.emotion.disgust,
					fear: object.emotion.fear,
					joy: object.emotion.joy,
					sadness: object.emotion.sadness,
					sentiment: object.sentiment.score
				};
				tableData.push(anObject);
				repeaterID++;
			});

			vm.cols = [
			{field:"text", filter:{ text:"text" }, show:true, sortable:"text", title:"Text"},
			{field:"count", filter:{ count:"number" }, show:true, sortable:"count", title:"Count"},
			{field:"type", filter:{ type:"text" }, show:true, sortable:"type", title:"Type"},
			{field:"relevance", filter:{ relevance:"number" }, show:true, sortable:"relevance", title:"Relevance"},
			{field:"anger", filter:{ anger:"number" },  show:true, sortable:"anger", title:"Anger"},
			{field:"disgust", filter:{ disgust:"number" }, show:true, sortable:"disgust", title:"Disgust"},
			{field:"fear", filter:{ fear:"number" }, show:true, sortable:"fear", title:"Fear"},
			{field:"joy", filter:{ joy:"number" }, show:true, sortable:"joy", title:"Joy"},
			{field:"sadness", filter:{	sadness:"number" }, show:true, sortable:"sadness", title:"Sadness"},
			{field:"sentiment", filter:{ sentiment:"number" }, show:true, sortable:"sentiment", title:"Sentiment"}
			];

			vm.tableParams = new NgTableParams({}, { dataset: tableData });
		}

		function keywordsTable() {
			var repeaterID = 0;
			responseData.keywords.forEach(function(object) {
				object.text = object.text || {};	// If no object child, set object to empty (to prevent undefined error)
				object.relevance = object.relevance || {};
				object.emotion = object.emotion || {};
				object.sentiment = object.sentiment || {};

				var anObject = 	{
					id: repeaterID,
					text: object.text,
					relevance: object.relevance,
					anger: object.emotion.anger,
					disgust: object.emotion.disgust,
					fear: object.emotion.fear,
					joy: object.emotion.joy,
					sadness: object.emotion.sadness,
					sentiment: object.sentiment.score
				};
				tableData.push(anObject);
				repeaterID++;
			});

			vm.cols = [
			{field:"text", filter:{ text:"text" }, show:true, sortable:"text", title:"Text"},
			{field:"relevance", filter:{ relevance:"number" }, show:true, sortable:"relevance", title:"Relevance"},
			{field:"anger", filter:{ anger:"number" },  show:true, sortable:"anger", title:"Anger"},
			{field:"disgust", filter:{ disgust:"number" }, show:true, sortable:"disgust", title:"Disgust"},
			{field:"fear", filter:{ fear:"number" }, show:true, sortable:"fear", title:"Fear"},
			{field:"joy", filter:{ joy:"number" }, show:true, sortable:"joy", title:"Joy"},
			{field:"sadness", filter:{	sadness:"number" }, show:true, sortable:"sadness", title:"Sadness"},
			{field:"sentiment", filter:{ sentiment:"number" }, show:true, sortable:"sentiment", title:"Sentiment"}
			];

			vm.tableParams = new NgTableParams({}, { dataset: tableData });

		}

		// More in DB, arrays in object fields, couldn't be bothered yet to work out how to add to tables
		function relationsTable() {
			var repeaterID = 0;
			responseData.relations.forEach(function(object) {
				object.arguments = object.arguments || {};	// If no object child, set object to empty (to prevent undefined error)
				object.sentence = object.sentence || {};
				object.type = object.type || {};
				object.score = object.score || {};

				var anObject = 	{
					id: repeaterID,
					argumentTextOne: object.arguments[0].text,
					sentence: object.sentence,
					argumentTextTwo: object.arguments[1].text,
					type: object.type,
					score: object.score
				};
				tableData.push(anObject);
				repeaterID++;
			});

			vm.cols = [
			{field:"argumentTextOne", filter:{ argumentTextOne:"text" }, show:true, sortable:"argumentTextOne", title:"Argument One"},
			{field:"sentence", filter:{ sentence:"text" }, show:true, sortable:"sentence", title:"Sentence"},
			{field:"argumentTextTwo", filter:{ argumentTextTwo:"text" }, show:true, sortable:"argumentTextTwo", title:"Argument Two"},
			{field:"type", filter:{ type:"text" }, show:true, sortable:"type", title:"Type"},
			{field:"score", filter:{ score:"number" }, show:true, sortable:"score", title:"Score"}
			];

			vm.tableParams = new NgTableParams({}, { dataset: tableData });	
		}

		function semanticRolesTable() {
			var repeaterID = 0;
			responseData.semanticRoles.forEach(function(object) {
				object.sentence = object.sentence || {};	// If no object child, set object to empty (to prevent undefined error)
				object.subject = object.subject || {};
				object.action = object.action || {};
				object.object = object.object || {};

				var anObject = {
					id: repeaterID,
					sentence: object.sentence,
					subjectText: object.subject.text,
					actionVerbText: object.action.verb.text,
					actionVerbTense: object.action.verb.tense,
					actionText: object.action.text,
					actionNormalized: object.action.normalized,
					objectText: object.object.text
				};
				tableData.push(anObject);
				repeaterID++;
			});

			vm.cols = [
			{field:"sentence", filter:{ sentence:"text" }, show:true, sortable:"sentence", title:"Sentence"},
			{field:"subjectText", filter:{ subjectText:"text" }, show:true, sortable:"subjectText", title:"Subject Text"},
			{field:"actionVerbText", filter:{ actionVerbText:"text" }, show:true, sortable:"actionVerbText", title:"Action Verb Text"},
			{field:"actionVerbTense", filter:{ actionVerbTense:"text" }, show:true, sortable:"actionVerbTense", title:"Action Verb Tense"},
			{field:"actionText", filter:{ actionText:"text" }, show:true, sortable:"actionText", title:"actionText"},
			{field:"actionNormalized", filter:{ actionNormalized:"text" }, show:true, sortable:"actionNormalized", title:"actionNormalized"},
			{field:"objectText", filter:{ objectText:"text" }, show:true, sortable:"objectText", title:"objectText"}
			];

			vm.tableParams = new NgTableParams({}, { dataset: tableData });
		}
	}

})();
