var mongoose = require('mongoose');
var AnalysisResults = mongoose.model('analysisResults');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	"username": "ac282974-cb6e-474b-b44f-8a0680ca52c9",
	"password": "qFuZ38BQwB8z",
	'version_date': '2017-02-27'
});

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
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
			sendJSONresponse(res, 503, error);
		}
		else {
			saveWatsonAnalysis(req, res, response);
		}
	});
};

module.exports.watsonTextAnalysis = function(req, res) {
	var parameters = {
		'text': req.body.text,
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

	natural_language_understanding.analyze(parameters, function(err, response) {
		if (err) {
			sendJSONresponse(res, 503, err);
		} else {
			saveWatsonAnalysis(req, res, response);
		}
	});
}

var saveWatsonAnalysis = function(req, res, response) {
	var analysisResults = new AnalysisResults();
	analysisResults.name = req.body.name;
	analysisResults.description = req.body.description;
	analysisResults.createdBy = req.body.createdBy;
	analysisResults.files = req.body.files;
	analysisResults.language = response.language;
	analysisResults.categories = response.categories;
	analysisResults.concepts = response.concepts;
	analysisResults.entities = response.entities;
	analysisResults.keywords = response.keywords;
	analysisResults.relations = response.relations;
	analysisResults.semanticRoles = response.semanticRoles;

	analysisResults.save(function(err) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else {
			sendJSONresponse(res, 200, {
				_id: analysisResults._id,
				name: analysisResults.name,
				createdBy: analysisResults.createdBy,
				dateCreated: analysisResults.dateCreated
			});
		}
	});	
};

module.exports.readWatsonAnalysis = function(req, res) {
	var id = req.query.id;
	var options = [
	{path: 'files', select: 'name path icon key textFileKey lastModified createdBy'}
	];

	if (id) {
		AnalysisResults
		.findById(id)
		.populate(options)
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

module.exports.readWatsonCategories = function(req, res) {
	var id = req.query.id;

	if (id) {
		AnalysisResults
		.findById(id, {_id: 0, categories: 1}, function(err, data) {
			if (!data) {
				sendJSONresponse(res, 404, {
					"message": "analysis not found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			sendJSONresponse(res, 200, data);
		});
	} else {
		sendJSONresponse(res, 400, {
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
			language: doc.language,
			dateCreated: doc.dateCreated,
			lastModified: doc.lastModified,
			files: doc.files,
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