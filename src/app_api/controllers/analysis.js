var mongoose = require('mongoose');
var AnalysisConcept = mongoose.model('AnalysisConcept');
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

module.exports.watsonNLUAnalysis = function(req, res) {

	var parameters = {
		'url': req.body.url,
		'features': {
			'entities': {
				'emotion': true,
				'sentiment': true,
				'limit': 5
			},
			'keywords': {
				'emotion': true,
				'sentiment': true,
				'limit': 5
			},
			'concepts': {
				'limit': 5
			}
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

module.exports.watsonConceptAnalysis = function(req, res) {
	var parameters = {
		'url': req.body.url,
		'features': {
			'concepts': {
				'limit': 50
			}
		}
	};

	natural_language_understanding.analyze(parameters, function(error, response) {
		if (error) {
			sendJSONresponse(res, 404, error);
		}
		else {
			sendJSONresponse(res, 200, response);
		}
	});

};

module.exports.listConceptAnalyses = function(req, res) {
	AnalysisConcept
	.find()
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No concept analyses found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			conceptAnalysesList = buildConceptAnalysesList(req, res, results);
			sendJSONresponse(res, 200, conceptAnalysesList);
		});

};

var buildConceptAnalysesList = function(req, res, results) {
	var conceptAnalysesList = [];
	results.forEach(function(doc) {
		conceptAnalysesList.push({
			name: doc.name,
			description: doc.description,
			createdBy: doc.createdBy,
			sourceDataKey: doc.sourceDataKey,
			language: doc.language,
			concepts: doc.concepts,
			dateCreated: doc.dateCreated,
			lastModified: doc.lastModified,
			_id: doc._id
		});
	});
	return conceptAnalysesList;
};

module.exports.saveConceptAnalysis = function(req, res) {
	var analysisConcept = new AnalysisConcept();

	analysisConcept.name = req.body.name
	analysisConcept.description = req.body.description;
	analysisConcept.createdBy = req.body.createdBy;
	analysisConcept.sourceDataKey = req.body.sourceDataKey;
	analysisConcept.language = req.body.language,
	analysisConcept.concepts = req.body.concepts;

	analysisConcept.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, analysisConcept);
		}
	});	
};

module.exports.readConceptAnalysis = function(req, res) {
	var id = req.query.id;
	if (id) {
		AnalysisConcept
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