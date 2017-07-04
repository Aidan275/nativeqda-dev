var mongoose = require('mongoose');
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
var textract = require('textract');

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

module.exports.watsonFileConversion = function(req, res) {
	var buffer = req.body.buffer;
	var type = req.body.buffer;

	textract.fromBufferWithMime(type, buffer, function( error, text ) {
		if (error) {
			sendJSONresponse(res, 404, error);
		}
		else {
			sendJSONresponse(res, 200, response);
		}
	});
};




