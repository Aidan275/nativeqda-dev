var mongoose = require('mongoose');
var Survey = mongoose.model('Survey');
var SurveyResponse = mongoose.model('SurveyResponse');
var shortid = require('shortid');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.saveSurvey = function(req, res) {
	var survey = new Survey();

	survey.surveyJSON  = req.body.surveyJSON;
	survey.name = req.body.name;
	survey.accessID = shortid.generate();
	survey.createdBy = req.body.createdBy;

	survey.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, survey);
		}
	});	
};

module.exports.readSurvey = function(req, res) {
	var accessID = req.query.accessID;
	if (accessID) {
		Survey
		.findOne({"accessID": accessID})
		.exec(
			function(err, results) {
				if (!results) {
					sendJSONresponse(res, 404, {
						"message": "Survey not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 200, results);
			});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No id in request"
		});
	}
};

module.exports.listSurveys = function(req, res) {
	Survey
	.find()
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No surveys found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			surveyList = buildSurveyList(req, res, results);
			sendJSONresponse(res, 200, surveyList);
		});
}

var buildSurveyList = function(req, res, results) {
	var surveyList = [];
	results.forEach(function(doc) {
		surveyList.push({
			surveyJSON: doc.surveyJSON,
			name: doc.name,
			accessID: doc.accessID,
			dateCreated: doc.dateCreated,
			lastModified: doc.lastModified,
			createdBy: doc.createdBy,
			_id: doc._id
		});
	});
	return surveyList;
};

module.exports.deleteSurvey = function(req, res) {
	var id = req.query.id;
	if(id) {
		Survey
		.findByIdAndRemove(id)
		.exec(
			function(err, results) {
				if (!results) {
					sendJSONresponse(res, 404, {
						"message": "Survey not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No id parameter in request"
		});
	}
};

module.exports.saveSurveyResponse = function(req, res) {
	var accessID = req.body.accessID;

	if(accessID) {
		var surveyResponse = new SurveyResponse();

		surveyResponse.responseJSON = req.body.responseJSON;
		surveyResponse.fullName = req.body.fullName;
		surveyResponse.email = req.body.email;
		surveyResponse.age = req.body.age;
		surveyResponse.gender = req.body.gender;

		Survey.updateOne(
			{ "accessID" : accessID },
			{
				$push: { "responses": surveyResponse },
			}, function(err, results) {
				if (!results) {
					sendJSONresponse(res, 404, {
						"message": "Survey not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No accessID or survey response included in request"
		});
	}
};

module.exports.readSurveyResponses = function(req, res) {
	var accessID = req.query.accessID;

	if(accessID) {
		Survey.findOne({ "accessID" : accessID }, 'responses', function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No survey reponses found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			sendJSONresponse(res, 200, results);
		});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No accessID or survey response included in request"
		});
	}
};

