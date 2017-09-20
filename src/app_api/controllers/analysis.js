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


/**
* @apiGroup Analysis
* @api {post} /api/analysis/watson 	Watson Analysis - URL
* @apiDescription Performs a Watson analysis, passing the URL to be analysed.  
* Saves the analysis results to the database upon completion.
* @apiPermission researcher
* @apiParam (Body Parameter) {String} url	URL to be analysed
* @apiParamExample {json} Request Example
*     {
*       "url": "https://nativeqda-assets.s3.amazonaws.com/text-data/2017/08/17/bdd5da3b116f50095a7b.txt"
*     }
* @apiSuccess {String} _id			ObjectId of the analysis object
* @apiSuccess {String} name			Name of the analysis as given by the user
* @apiSuccess {String} createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 	The date the analysis was created
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     {
*       "_id": "59c132da6bea374820a47f37",
*       "name": "Language Analysis",
*       "createdBy": "Michael",
*       "dateCreated": "2017-09-19T15:08:10.521Z"
*     }
* @apiUse InternalServerError
* @apiUse ServiceUnavailableError
*/
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

	natural_language_understanding.analyze(parameters, function(err, response) {
		if (err) {
			sendJSONresponse(res, 503, err);
		}
		else {
			saveWatsonAnalysis(req, res, response);
		}
	});
};


/**
* @apiGroup Analysis
* @api {post} /api/analysis/watsonText 	Watson Analysis - Text
* @apiDescription Performs a Watson analysis, passing the content to be analysed as a string of text.  
* Saves the analysis results to the database upon completion.
* @apiPermission researcher
* @apiParam (Body Parameter) {String} text	String of text to be analysed
* @apiParamExample {json} Request Example
*     {
*       "text": "Garcia’s (2009) main thesis is that bilingual education is the only way to educate children..."
*     }
* @apiSuccess {String} _id			ObjectId of the analysis object
* @apiSuccess {String} name			Name of the analysis as given by the user
* @apiSuccess {String} createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 	The date the analysis was created
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     {
*       "_id": "59c132da6bea374820a47f37",
*       "name": "Language Analysis",
*       "createdBy": "Michael",
*       "dateCreated": "2017-09-19T15:08:10.521Z"
*     }
* @apiUse InternalServerError
* @apiUse ServiceUnavailableError
*/
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


/**
* @apiGroup Analysis
* @api {get} /api/analysis/watson/read/:id	Read Results - All
* @apiDescription Reads all the results of a given Watson analysis.  
* @apiPermission researcher
* @apiParam (URL Parameter) {String} id	ObjectId of the analysis object
* @apiSuccess {String} _id				ObjectId of the analysis object
* @apiSuccess {String} name				Name of the analysis as given by the user
* @apiSuccess {String} createdBy 		First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 		The date the analysis was created
* @apiSuccess {More} More 				More
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     {
*       "_id": "59c132da6bea374820a47f37",
*       "name": "Language Analysis",
*       "createdBy": "Michael",
*       "dateCreated": "2017-09-19T15:08:10.521Z",
*       ...
*     }
* @apiUse AnalysisNotFoundError
* @apiUse NoIdInRequestError
* @apiUse InternalServerError
*/
module.exports.readWatsonAnalysis = function(req, res) {
	var id = req.params['id'];
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
						"message": "Analysis not found"
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


/**
* @apiGroup Analysis
* @api {get} /api/analysis/watson/read/:id/categories 	Read Results - Categories
* @apiDescription Reads the category results of a given Watson analysis.  
* @apiPermission researcher
* @apiParam (URL Parameter) {String} id	ObjectId of the analysis object
* @apiSuccess {Object[]} categories		List of Category objects (Array of Objects)
* @apiSuccess {Number} categories.score Category score
* @apiSuccess {String} categories.label Category label
* @apiSuccess {String} categories._id 	Category id
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     "categories" : [{
*        "score" : 0.488511,
*        "label" : "/pets/cats",
*        "_id" : "59c12f70af3cc9188cbf784b"
*    },
*    {
*        "score" : 0.427007,
*        "label" : "/home and garden",
*        "_id" : "59c12f70af3cc9188cbf784a"
*    }]
* @apiUse AnalysisNotFoundError
* @apiUse NoIdInRequestError
* @apiUse InternalServerError
*/
module.exports.readWatsonCategories = function(req, res) {
	var id = req.params['id'];

	if (id) {
		AnalysisResults
		.findById(id, {_id: 0, categories: 1}, function(err, data) {
			if (!data) {
				sendJSONresponse(res, 404, {
					"message": "Analysis not found"
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


/**
* @apiGroup Analysis
* @api {get} /api/analysis/watson/list	List Results
* @apiDescription Lists details for all the Watson analyses.  
* @apiPermission researcher
* @apiSuccess {Object[]} analysis			List of Watson analysis objects (Array of Objects)
* @apiSuccess {String} analysis._id			ObjectId of the analysis object
* @apiSuccess {String} analysis.name		Name of the analysis as given by the user
* @apiSuccess {String} analysis.createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} analysis.dateCreated 	The date the analysis was created
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     [{
*       "_id": "59c132da6bea374820a47f37",
*       "name": "Language Analysis",
*       "createdBy": "Michael",
*       "dateCreated": "2017-09-19T15:08:10.521Z"
*     },
*     {
*       "_id": "5985071083dba80dfced4422",
*       "name": "Interview",
*       "createdBy": "Anu",
*       "dateCreated": "2017-08-04T23:45:20.243Z"
*     }]
* @apiUse AnalysisNotFoundError
* @apiUse NoIdInRequestError
* @apiUse InternalServerError
*/
module.exports.listWatsonAnalysis = function(req, res) {
	AnalysisResults
	.find({}, 'name createdBy dateCreated')
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "Analysis not found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			analysisList = buildAnalysisList(req, res, results);
			sendJSONresponse(res, 200, analysisList);
		});
};


/**
* @apiGroup Analysis
* @api {delete} /api/analysis/watson/:id	Delete Result
* @apiDescription Deletes the results of a given Watson analysis
* @apiPermission researcher
* @apiParam (URL Parameter) {String} id 	ObjectId of the analysis object
* @apiSuccess {String} analysis._id			ObjectId of the analysis object
* @apiSuccess {String} analysis.name		Name of the analysis as given by the user
* @apiSuccess {String} analysis.createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} analysis.dateCreated 	The date the analysis was created
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 200 OK
*     [{
*       "_id": "59c132da6bea374820a47f37",
*       "name": "Language Analysis",
*       "createdBy": "Michael",
*       "dateCreated": "2017-09-19T15:08:10.521Z"
*     },
*     {
*       "_id": "5985071083dba80dfced4422",
*       "name": "Interview",
*       "createdBy": "Anu",
*       "dateCreated": "2017-08-04T23:45:20.243Z"
*     }]
* @apiUse AnalysisNotFoundError
* @apiUse NoIdInRequestError
* @apiUse InternalServerError
*/
module.exports.deleteWatsonAnalysis = function(req, res) {
	var id = req.params['id'];
	if(id) {
		AnalysisResults
		.findByIdAndRemove(id)
		.exec(
			function(err, results) {
				if (err) {
					sendJSONresponse(res, 500, err);
					return;
				}
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 400, {
			"message": "No id in request"
		});
	}
};


/* ============== HELPER FUNCTIONS ============== */


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

/* ============== API Definitions for inheritance ============== */

/**
* @apiDefine AnalysisNotFoundError
*
* @apiError AnalysisNotFound The id of the Analysis was not found
*
* @apiErrorExample {json} Error 404
*     HTTP/1.1 404 Not Found 
*     {
*       "message": "Analysis not found"
*     }
*/

/**
* @apiDefine NoIdInRequestError
*
* @apiError NoIdInRequest No id was included in the request
*
* @apiErrorExample {json} Error 400
*     HTTP/1.1 400 Bad Request
*     {
*       "message": "No id in request"
*     }
*/

/**
* @apiDefine InternalServerError
*
* @apiError InternalServerError Internal server error
*
* @apiErrorExample {json} Error 500
*     HTTP/1.1 500 Internal Server Error
*/

/**
* @apiDefine ServiceUnavailableError
*
* @apiError ServiceUnavailable Watson service unavailable
*
* @apiErrorExample {json} Error 503
*     HTTP/1.1 503 Service Unavailable
*/

