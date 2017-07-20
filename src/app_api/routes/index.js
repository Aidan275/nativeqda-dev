var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});

var ctrlAuth = require('../controllers/authentication');
var ctrlDataset = require('../controllers/datasets');
var ctrlEvent = require('../controllers/events');
var ctrlFile = require('../controllers/files');
var ctrlAnalysis = require('../controllers/analysis');
var ctrlUsers = require('../controllers/users');
var ctrlSurveys = require('../controllers/surveys');

// Middleware to check the connection status of the database. For any request that involves 
// the database, add this function to the request parameters to check the connection status. 
// if 'connected' the request will conintue, otherwise it will responds with an error.
function checkDatabaseStatus(req, res, next) {
	if(mongoose.connection.readyState === 1) {	// 'connected' = 1
		next();
	} else {
		res.status(500);
		res.json({errmsg: "Databse connection error."});
	}
}

// authentication
router.post('/api/register', checkDatabaseStatus, ctrlAuth.register);
router.post('/api/login', checkDatabaseStatus, ctrlAuth.login);
router.post('/api/user/setavatar', auth, checkDatabaseStatus, ctrlAuth.setavatar); //Deprecated. Use 'POST /user/info' below instead.

//Users
router.get('/api/user/info', auth, checkDatabaseStatus, ctrlUsers.getUserInfo);
router.post('/user', auth, checkDatabaseStatus, ctrlUsers.updateProfile); //Update the user's details
router.get('/user/:email', auth, checkDatabaseStatus, ctrlUsers.getUserProfile); //View a user's profile

// datasets
router.post('/api/analysis/data/create', auth, checkDatabaseStatus, ctrlDataset.datasetCreate);
router.get('/api/analysis/data/list', auth, checkDatabaseStatus, ctrlDataset.listDatasets);
router.get('/api/analysis/data/read/:datasetid', auth, checkDatabaseStatus, ctrlDataset.datasetReadOne);
router.delete('/api/analysis/data/delete', auth, checkDatabaseStatus, ctrlDataset.deleteDatasetDB);

//Event (Logging)
router.post('/api/event', checkDatabaseStatus, ctrlEvent.event);

//Files
router.post('/api/files/signUploadS3', auth, checkDatabaseStatus, ctrlFile.signUploadS3);
router.get('/api/files/signDownloadS3', auth, checkDatabaseStatus, ctrlFile.signDownloadS3);
router.get('/api/files/getFileListS3', auth, ctrlFile.getFileListS3);
router.post('/api/files/deleteFileS3', auth, checkDatabaseStatus, ctrlFile.deleteFileS3);
router.post('/api/files/addFileDB', auth, checkDatabaseStatus, ctrlFile.addFileDB);
router.get('/api/files/getFileListDB', auth, checkDatabaseStatus, ctrlFile.getFileListDB);
router.get('/api/files/fileReadOneDB', auth, checkDatabaseStatus, ctrlFile.fileReadOneDB);
router.delete('/api/files/deleteFileDB', auth, checkDatabaseStatus, ctrlFile.deleteFileDB);
router.post('/api/files/syncDBwithS3', auth, checkDatabaseStatus, ctrlFile.syncDBwithS3);
router.post('/api/files/objectAclS3', auth, checkDatabaseStatus, ctrlFile.objectAclS3);
router.post('/api/files/objectAclDB', auth, checkDatabaseStatus, ctrlFile.objectAclDB);

//Analysis
router.post('/api/analysis/aylien/concept', auth, ctrlAnalysis.aylienConceptAnalysis);
router.post('/api/analysis/watson', auth, checkDatabaseStatus, ctrlAnalysis.watsonAnalysis);
router.post('/api/analysis/watson/save', auth, checkDatabaseStatus, ctrlAnalysis.saveWatsonAnalysis);
router.get('/api/analysis/watson/read', auth, checkDatabaseStatus, ctrlAnalysis.readWatsonAnalysis);
router.get('/api/analysis/watson/list', auth, checkDatabaseStatus, ctrlAnalysis.listWatsonAnalysis);
router.delete('/api/analysis/watson/delete', auth, checkDatabaseStatus, ctrlAnalysis.deleteWatsonAnalysis);

//Surveys
router.post('/api/survey/save', auth, checkDatabaseStatus, ctrlSurveys.saveSurvey);
router.get('/api/survey/read', auth, checkDatabaseStatus, ctrlSurveys.readSurvey);
router.get('/api/survey/list', auth, checkDatabaseStatus, ctrlSurveys.listSurveys);
router.delete('/api/survey/delete', auth, checkDatabaseStatus, ctrlSurveys.deleteSurvey);
router.post('/api/survey/response/save', auth, checkDatabaseStatus, ctrlSurveys.saveSurveyResponse);
router.get('/api/survey/responses/read', auth, checkDatabaseStatus, ctrlSurveys.readSurveyResponses);


module.exports = router;
