var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});

var ctrlAuth = require('../controllers/auth');
var ctrlDataset = require('../controllers/datasets');
var ctrlFile = require('../controllers/files');
var ctrlS3 = require('../controllers/s3');
var ctrlAnalysis = require('../controllers/analysis');
var ctrlUsers = require('../controllers/users');
var ctrlSurveys = require('../controllers/surveys');
var ctrlSettings = require('../controllers/settings');
var ctrlMap = require('../controllers/map');

/* Middleware to check the connection status of the database. For any request that involves */
/* the database, add this function to the request parameters to check the connection status. */
/* if 'connected' the request will conintue, otherwise it will responds with an error. */
function checkDatabaseStatus(req, res, next) {
	if(mongoose.connection.readyState === 1) {	/* connected = 1 */
		next();
	} else {
		res.status(500);
		res.json({errmsg: "Database connection error."});
	}
}

/* Authentication */
router.post('/register', checkDatabaseStatus, ctrlAuth.register);
router.post('/login', checkDatabaseStatus, ctrlAuth.login);
router.post('/password/forgot', checkDatabaseStatus, ctrlAuth.forgotPassword);
router.post('/password/reset', checkDatabaseStatus, ctrlAuth.resetPassword);

/* System Settings [User Settings are part of Users data/controller] */
router.get('/settings', auth, checkDatabaseStatus, ctrlSettings.getSettings);
router.put('/settings', auth, checkDatabaseStatus, ctrlSettings.setSettings);

/* Users */
router.post('/user', auth, checkDatabaseStatus, ctrlUsers.createUser);
router.get('/user/info', auth, checkDatabaseStatus, ctrlUsers.getUserInfo);
router.get('/users/info', auth, checkDatabaseStatus, ctrlUsers.getAllUsersInfo);			/* Gets all users info */
router.get('/user/last-modified', auth, checkDatabaseStatus, ctrlUsers.userLastModified);	/* Get the date the user's info was last modified */
router.get('/user/avatar/:email', checkDatabaseStatus, ctrlUsers.getAvatar);				/* Get the avatar for the email address for the login page */
router.put('/user', auth, checkDatabaseStatus, ctrlUsers.updateProfile);					/* Update the user's details */
router.delete('/user/:email', auth, checkDatabaseStatus, ctrlUsers.deleteUser);				/* Delete a User's account */
/* router.get('/user/:email', auth, checkDatabaseStatus, ctrlUsers.getUserProfile); */		/* View a user's profile - Not sure if this is still needed? Is interfering with the route below (/user/last-modified) */

/* User Roles */
router.get('/user/:email/roles', auth, checkDatabaseStatus, ctrlUsers.getUserRoles);			/* Get all the roles a user has */
router.put('/user/:email/roles', auth, checkDatabaseStatus, ctrlUsers.putUserRole);				/* Assign a role to a user - NOTE: was getting a weird authorization error when sending the request without including a body so changed the request to send the role in the body. */
router.delete('/user/:email/roles/:role', auth, checkDatabaseStatus, ctrlUsers.deleteUserRole);	/* Un-assign a role to a user */

router.get('/roles/:rolename', auth, checkDatabaseStatus, ctrlUsers.getRoles);			/* Get a specific role or a list of all the user role objects (More likely) */
router.put('/roles/:rolename', auth, checkDatabaseStatus, ctrlUsers.putRole);			/* Create or update a user role */
router.delete('/roles/:rolename', auth, checkDatabaseStatus, ctrlUsers.deleteRole);		/* Remove a user role from the system */

/* Datasets */
router.post('/analysis/data/create', auth, checkDatabaseStatus, ctrlDataset.datasetCreate);
router.get('/analysis/data/list', auth, checkDatabaseStatus, ctrlDataset.listDatasets);
router.get('/analysis/data/read/:datasetid', auth, checkDatabaseStatus, ctrlDataset.datasetReadOne);
router.delete('/analysis/data/delete', auth, checkDatabaseStatus, ctrlDataset.deleteDatasetDB);

/* File operations - download link, get info, update/upload, delete */
router.get('/files/:filepath(*)/download', auth, checkDatabaseStatus, ctrlS3.signDownload); //TODO
router.get('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.getFile);
router.put('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.putFile);
router.delete('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.deleteFile);

/* Tag and criteria search of the file system */
router.get('/files/?tags=:tags', auth, checkDatabaseStatus, ctrlUsers.getUserProfile);
router.get('/files/?search=:query', auth, checkDatabaseStatus, ctrlUsers.getUserProfile);

/* Get (limited) file info for pins on the map based on some criteria. Ie. Limited in spatial or time range */
router.get('/map', auth, checkDatabaseStatus, ctrlFile.map);

/* S3 operations */
router.post('/s3/signUpload', auth, checkDatabaseStatus, ctrlS3.signUpload);
router.get('/s3/signDownload/:key(*)', auth, checkDatabaseStatus, ctrlS3.signDownloadKey);
router.get('/s3/list', auth, ctrlS3.getFileList);
router.delete('/s3/:key(*)', auth, checkDatabaseStatus, ctrlS3.deleteFile);
router.post('/s3/syncDB', auth, checkDatabaseStatus, ctrlS3.syncDB);
router.post('/s3/:key/acl', auth, checkDatabaseStatus, ctrlS3.acl);

/* ================================================== */
/* ==================== Analysis ==================== */
/* ================================================== */

/**
* @api {post} /api/analysis/watson 	Perform Watson analysis - url
* 
* @apiParam {String} url 			URL to be analysed
*
* @apiGroup Analysis
* @apiSuccess {String} _id			ObjectId of the analysis object
* @apiSuccess {String} name			Name of the analysis as given by the user
* @apiSuccess {String} createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 	The date the analysis was created
*
* @apiSuccessExample {json} Success 200
*    HTTP/1.1 200 OK
*    [{
*      "_id": "59c132da6bea374820a47f37",
*      "name": "Language Analysis",
*      "createdBy": "John",
*      "dateCreated": "2017-09-19T15:08:10.521Z"
*    }]
*
* @apiErrorExample {json} Error 500
*    HTTP/1.1 500 Internal Server Error
* @apiErrorExample {json} Error 503
*    HTTP/1.1 503 Service Unavailable
*/
router.post('/analysis/watson', auth, checkDatabaseStatus, ctrlAnalysis.watsonAnalysis);

/**
* @api {post} /api/analysis/watsonText 	Perform Watson analysis - text
* 
* @apiParam {String} text 			String of text to be analysed
*
* @apiGroup Analysis
* @apiSuccess {String} _id			ObjectId of the analysis object
* @apiSuccess {String} name			Name of the analysis as given by the user
* @apiSuccess {String} createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 	The date the analysis was created
*
* @apiSuccessExample {json} Success 200
*    HTTP/1.1 200 OK
*    [{
*      "_id": "59c132da6bea374820a47f37",
*      "name": "Language Analysis",
*      "createdBy": "John",
*      "dateCreated": "2017-09-19T15:08:10.521Z"
*    }]
*
* @apiErrorExample {json} Error 500
*    HTTP/1.1 500 Internal Server Error
* @apiErrorExample {json} Error 503
*    HTTP/1.1 503 Service Unavailable
*/
router.post('/analysis/watsonText', auth, checkDatabaseStatus, ctrlAnalysis.watsonTextAnalysis);

/**
* @api {get} /api/analysis/watson/read 	Read one Watson analysis
* 
* @apiParam {String} _id 			ObjectId of the analysis object
*
* @apiGroup Analysis
* @apiSuccess {String} _id			ObjectId of the analysis object
* @apiSuccess {String} name			Name of the analysis as given by the user
* @apiSuccess {String} createdBy 	First name of the user who created the analysis
* @apiSuccess {Date} dateCreated 	The date the analysis was created
* @apiSuccess {More} More 			More
*
* @apiSuccessExample {json} Success 200
*    HTTP/1.1 200 OK
*    [{
*      "_id": "59c132da6bea374820a47f37",
*      "name": "Language Analysis",
*      "createdBy": "John",
*      "dateCreated": "2017-09-19T15:08:10.521Z"
*    }]
*
* @apiErrorExample {json} Error 500
*    HTTP/1.1 500 Internal Server Error
* @apiErrorExample {json} Error 503
*    HTTP/1.1 503 Service Unavailable
*/
router.get('/analysis/watson/read', auth, checkDatabaseStatus, ctrlAnalysis.readWatsonAnalysis);

/**
* @api {get} /api/analysis/watson/read/categories 	Read category results of a Watson analysis
* 
* @apiParam {String} _id 			ObjectId of the analysis object
*
* @apiGroup Analysis
* @apiSuccess {Object[]} categories			List of Category objects (Array of Objects)
* @apiSuccess {Number} categories.score 	Category score
* @apiSuccess {String} categories.label 	Category label
* @apiSuccess {String} categories._id 		Category id
*
* @apiSuccessExample {json} Success 200
*    HTTP/1.1 200 OK
*    "categories" : [{
*       "score" : 0.488511,
*       "label" : "/pets/cats",
*       "_id" : "59c12f70af3cc9188cbf784b"
*   },
*   {
*       "score" : 0.427007,
*       "label" : "/home and garden",
*       "_id" : "59c12f70af3cc9188cbf784a"
*   }]
*
* @apiErrorExample {json} Error 404
*    HTTP/1.1 404 Not Found
* @apiErrorExample {json} Error 500
*    HTTP/1.1 500 Internal Server Error
* @apiErrorExample {json} Error 503
*    HTTP/1.1 503 Service Unavailable
*/
router.get('/analysis/watson/read/categories', auth, checkDatabaseStatus, ctrlAnalysis.readWatsonCategories);

router.get('/analysis/watson/list', auth, checkDatabaseStatus, ctrlAnalysis.listWatsonAnalysis);
router.delete('/analysis/watson/delete', auth, checkDatabaseStatus, ctrlAnalysis.deleteWatsonAnalysis);

/* Surveys */
router.post('/survey/save', checkDatabaseStatus, ctrlSurveys.saveSurvey);
router.get('/survey/check', checkDatabaseStatus, ctrlSurveys.checkSurvey);
router.get('/survey/read', auth, checkDatabaseStatus, ctrlSurveys.readSurvey);
router.get('/survey/read/json/:accessId', checkDatabaseStatus, ctrlSurveys.readSurveyJSON);
router.get('/survey/list', auth, checkDatabaseStatus, ctrlSurveys.listSurveys);
router.delete('/survey/delete', auth, checkDatabaseStatus, ctrlSurveys.deleteSurvey);
router.post('/survey/response/save/:responseId?', checkDatabaseStatus, ctrlSurveys.saveSurveyResponse); //Post a survery reponse or, with a responeId, update one.
router.get('/survey/:accessId/response/:responseId', auth, checkDatabaseStatus, ctrlSurveys.readOneSurveyResponse);
router.get('/survey/responses/read', auth, checkDatabaseStatus, ctrlSurveys.readSurveyResponses);

/* Map Marker Link */
router.put('/map/link', auth, checkDatabaseStatus, ctrlMap.putLink);
router.get('/map/link', auth, checkDatabaseStatus, ctrlMap.getLinks);
router.delete('/map/link/:id', auth, checkDatabaseStatus, ctrlMap.deleteLink);

module.exports = router;