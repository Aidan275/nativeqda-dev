var mongoose = require('mongoose');
var AnalysisResults = mongoose.model('analysisResults');
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
	application_id: "82b88370",
	application_key: "f5a54d679ae9544885175a11b26d7efd"
});
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	"username": "59b56219-6926-4cf8-93d4-40c3202eba5c",
	"password": "eAf38DQyEj1g",
	'version_date': '2017-02-27'
});

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.aylienConceptAnalysis = function(req, res) {
	var text = req.body.text;
	var language = req.body.language; 

	textapi.concepts({
		'text': text,
		'language': language
	}, function(error, response) {
		if (error === null) {
			sendJSONresponse(res, 200, response);
		} else {
			sendJSONresponse(res, 404, error);
		}
	});
};

module.exports.watsonAnalysis = function(req, res) {
	var parameters = {
		'url': req.body.url,
		'features': {
			'categories': {},
			'concepts': {
				'limit': 50
			},
			'entities': {
				'emotion': true,
				'sentiment': true,
				'limit': 250
			},
			'keywords': {
				'emotion': true,
				'sentiment': true,
				'limit': 250
			},
			'relations': {},
			'semantic_roles': {}
		}
	}

	natural_language_understanding.analyze(parameters, function(error, response) {
		if (error) {
			sendJSONresponse(res, 404, error);
		}
		else {
			sendJSONresponse(res, 200, response);
		}
	});
};

module.exports.saveWatsonAnalysis = function(req, res) {
	var analysisResults = new AnalysisResults();

	analysisResults.name = req.body.name
	analysisResults.description = req.body.description;
	analysisResults.createdBy = req.body.createdBy;
	analysisResults.sourceDataKey = req.body.sourceDataKey;
	analysisResults.language = req.body.language,
	analysisResults.categories = req.body.categories;
	analysisResults.concepts = req.body.concepts;
	analysisResults.entities = req.body.entities;
	analysisResults.keywords = req.body.keywords;
	analysisResults.relations = req.body.relations;
	analysisResults.semanticRoles = req.body.semanticRoles;

	analysisResults.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, analysisResults);
		}
	});	
};

module.exports.readWatsonAnalysis = function(req, res) {
	var id = req.query.id;
	if (id) {
		AnalysisResults
		.findById(id)
		.exec(
			function(err, data) {
				if (!data) {
					sendJSONresponse(res, 404, {
						"message": "analysis not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 200, data);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No id in request"
		});
	}
};

module.exports.listWatsonAnalysis = function(req, res) {
	AnalysisResults
	.find()
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No analyses found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			analysisList = buildAnalysisList(req, res, results);
			sendJSONresponse(res, 200, analysisList);
		});
};

var buildAnalysisList = function(req, res, results) {
	var analysisList = [];
	results.forEach(function(doc) {
		analysisList.push({
			name: doc.name,
			description: doc.description,
			createdBy: doc.createdBy,
			sourceDataKey: doc.sourceDataKey,
			language: doc.language,
			dateCreated: doc.dateCreated,
			lastModified: doc.lastModified,
			_id: doc._id
		});
	});
	return analysisList;
};

module.exports.deleteWatsonAnalysis = function(req, res) {
	var id = req.query.id;
	if(id) {
		AnalysisResults
		.findByIdAndRemove(id)
		.exec(
			function(err, results) {
				if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No id parameter in request"
		});
	}
};