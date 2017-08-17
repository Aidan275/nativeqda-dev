var mongoose = require('mongoose');
var Survey = mongoose.model('Survey');
var SurveyResponse = mongoose.model('SurveyResponse');
var shortid = require('shortid');
var moment = require('moment');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.saveSurvey = function(req, res) {
	var survey = new Survey();

	survey.surveyJSON  = req.body.surveyJSON;
	survey.name = req.body.name;
	survey.accessId = shortid.generate();
	survey.createdBy = req.body.createdBy;

	survey.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, survey);
		}
	});	
};

module.exports.checkSurvey = function(req, res) {
	var accessId = req.query.accessId;
	var ipAddress = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;

	if (accessId) {
		Survey
		.findOne({"accessId": accessId})
		.exec(
			function(err, survey) {
				if (!survey) {
					sendJSONresponse(res, 404, {
						"message": "Survey not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}

				var foundResponse;

				var response = survey.responses.filter(function (response) {	/* Checks if the users IP address to see if the user has previously completed the survey */
					if(response.ipAddress === ipAddress) {
						foundResponse = response;
						return;
					}
				});

				if(!foundResponse) {	/* If the users IP address does not exist in the survey responses return success */
					sendJSONresponse(res, 200, {
						"message": "Survey ready"
					});
					return;
				} else if(moment().valueOf() < moment(foundResponse.dateCreated).valueOf() + 300000) {	/* If the users IP address does exist and the survey was completed less than 5 minutes before */
					sendJSONresponse(res, 401, {														/* the last response was saved, respond with an unauthorised error and the error message below */
						"message": "You have already completed this survey, please wait 5 minutes to access the survey again."
					});
					return;
				}

				/* Above could probably be achieved neater without using moment */

				sendJSONresponse(res, 200, {	/* If for whatever other possibility, return success with survey ready message */
					"message": "Survey ready"
				});
			});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No id in request"
		});
	}
};

module.exports.readSurvey = function(req, res) {
	var accessId = req.query.accessId;
	if (accessId) {
		Survey
		.findOne({"accessId": accessId})
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
			accessId: doc.accessId,
			dateCreated: doc.dateCreated,
			lastModified: doc.lastModified,
			createdBy: doc.createdBy,
			numResponses: doc.numResponses,
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
	var accessId = req.body.accessId;

	if(accessId) {
		var surveyResponse = new SurveyResponse();

		surveyResponse.responseJSON = req.body.responseJSON;
		surveyResponse.ipAddress = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
		surveyResponse.fullName = req.body.fullName;
		surveyResponse.email = req.body.email;
		surveyResponse.age = req.body.age;
		surveyResponse.gender = req.body.gender;

		Survey.findOneAndUpdate(
			{ "accessId" : accessId },
			{ $push: { "responses": surveyResponse }, $inc: { numResponses: 1} },
			{ upsert: true },	// Creates the object if it doesn't exist. defaults to false.
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
			"message": "No accessId or survey response included in request"
		});
	}
};

module.exports.readOneSurveyResponse = function(req, res) {
	var accessId = req.params["accessId"];
	var responseId = req.params["responseId"];

	if(accessId) {
		Survey.findOne({ "accessId" : accessId }, function(err, survey) {
			if (!survey) {
				sendJSONresponse(res, 404, {
					"message": "No survey found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}

			var response = survey.responses.id(responseId)

			if(!response) {
				sendJSONresponse(res, 404, {
					"message": "No survey response found"
				});
				return;
			}

			sendJSONresponse(res, 200, response);
		});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No accessId included in request"
		});
	}
};


module.exports.readSurveyResponses = function(req, res) {
	var accessId = req.query.accessId;

	if(accessId) {
		Survey.findOne({ "accessId" : accessId }, 'responses', function(err, results) {
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
			"message": "No accessId included in request"
		});
	}
};

