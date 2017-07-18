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
router.post('/register', checkDatabaseStatus, ctrlAuth.register);
router.post('/login', checkDatabaseStatus, ctrlAuth.login);
router.post('/user/setavatar', auth, checkDatabaseStatus, ctrlAuth.setavatar);

// datasets
router.post('/analysis/data/create', auth, checkDatabaseStatus, ctrlDataset.datasetCreate);
router.get('/analysis/data/list', auth, checkDatabaseStatus, ctrlDataset.listDatasets);
router.get('/analysis/data/read/:datasetid', auth, checkDatabaseStatus, ctrlDataset.datasetReadOne);
router.delete('/analysis/data/delete', auth, checkDatabaseStatus, ctrlDataset.deleteDatasetDB);

router.post('/event', checkDatabaseStatus, ctrlEvent.event);

router.post('/files/signUploadS3', auth, checkDatabaseStatus, ctrlFile.signUploadS3);
router.get('/files/signDownloadS3', auth, checkDatabaseStatus, ctrlFile.signDownloadS3);
router.get('/files/getFileListS3', auth, ctrlFile.getFileListS3);
router.post('/files/deleteFileS3', auth, checkDatabaseStatus, ctrlFile.deleteFileS3);
router.post('/files/addFileDB', auth, checkDatabaseStatus, ctrlFile.addFileDB);
router.get('/files/getFileListDB', auth, checkDatabaseStatus, ctrlFile.getFileListDB);
router.get('/files/fileReadOneDB', auth, checkDatabaseStatus, ctrlFile.fileReadOneDB);
router.delete('/files/deleteFileDB', auth, checkDatabaseStatus, ctrlFile.deleteFileDB);
router.post('/files/syncDBwithS3', auth, checkDatabaseStatus, ctrlFile.syncDBwithS3);
router.post('/files/objectAclS3', auth, checkDatabaseStatus, ctrlFile.objectAclS3);
router.post('/files/objectAclDB', auth, checkDatabaseStatus, ctrlFile.objectAclDB);

router.post('/analysis/aylien/concept', auth, ctrlAnalysis.aylienConceptAnalysis);
router.post('/analysis/watson', auth, checkDatabaseStatus, ctrlAnalysis.watsonAnalysis);
router.post('/analysis/watson/save', auth, checkDatabaseStatus, ctrlAnalysis.saveWatsonAnalysis);
router.get('/analysis/watson/read', auth, checkDatabaseStatus, ctrlAnalysis.readWatsonAnalysis);
router.get('/analysis/watson/list', auth, checkDatabaseStatus, ctrlAnalysis.listWatsonAnalysis);
router.delete('/analysis/watson/delete', auth, checkDatabaseStatus, ctrlAnalysis.deleteWatsonAnalysis);

router.get('/user/info', auth, checkDatabaseStatus, ctrlUsers.getUserInfo);

router.post('/survey/save', auth, checkDatabaseStatus, ctrlSurveys.saveSurvey);
router.get('/survey/read', auth, checkDatabaseStatus, ctrlSurveys.readSurvey);
router.get('/survey/list', auth, checkDatabaseStatus, ctrlSurveys.listSurveys);

module.exports = router;
