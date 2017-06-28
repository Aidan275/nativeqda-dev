var mongoose = require('mongoose');
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
	application_id: "82b88370",
	application_key: "f5a54d679ae9544885175a11b26d7efd"
});

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.analysisConcept = function(req, res) {
	var text = req.body.text;
	var language = req.body.language; 

	textapi.concepts({
		'text': text,
		'language': language
		}, function(error, response) {
			if (error === null) {
				console.log(response);
				sendJSONresponse(res, 200, response);
			} else {
				sendJSONresponse(res, 404, error);
			}
		}
	);
};






