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
var ctrlSettings = require('../controllers/settings');

// Middleware to check the connection status of the database. For any request that involves 
// the database, add this function to the request parameters to check the connection status. 
// if 'connected' the request will conintue, otherwise it will responds with an error.
function checkDatabaseStatus(req, res, next) {
	if(mongoose.connection.readyState === 1) {	// 'connected' = 1
		next();
	} else {
		res.status(500);
		res.json({errmsg: "Database connection error."});
	}
}

// authentication
router.post('/register', checkDatabaseStatus, ctrlAuth.register);
router.post('/login', checkDatabaseStatus, ctrlAuth.login);
router.post('/user/setavatar', auth, checkDatabaseStatus, ctrlAuth.setavatar); //Deprecated. Use 'PUT /user/' below instead.

//System Settings [User Settings are part of Users data/controller]
router.get('/settings', auth, checkDatabaseStatus, ctrlSettings.getSettings);
router.put('/settings', auth, checkDatabaseStatus, ctrlSettings.setSettings);

//Users
router.get('/user/info', auth, checkDatabaseStatus, ctrlUsers.getUserInfo);
router.get('/users/info', auth, checkDatabaseStatus, ctrlUsers.getAllUsersInfo);	/* Gets all users info */
router.put('/user', auth, checkDatabaseStatus, ctrlUsers.updateProfile); //Update the user's details
/* router.get('/user/:email', auth, checkDatabaseStatus, ctrlUsers.getUserProfile); //View a user's profile */ /* Not sure if this is still needed? Is interfering with the route below (/user/last-modified) */
router.get('/user/last-modified', auth, checkDatabaseStatus, ctrlUsers.userLastModified); // Get the date the user's info was last modified

//User Roles
router.get('/roles/:rolename?', auth, checkDatabaseStatus, ctrlUsers.getRoles); //Get a specific role or a list of all the user role objects (More likely)
router.put('/roles/:rolename', auth, checkDatabaseStatus, ctrlUsers.putRole); //Create or update a user role
router.delete('/roles/:rolename', auth, checkDatabaseStatus, ctrlUsers.deleteRole); //Remove a user role from the system

// datasets
router.post('/analysis/data/create', auth, checkDatabaseStatus, ctrlDataset.datasetCreate);
router.get('/analysis/data/list', auth, checkDatabaseStatus, ctrlDataset.listDatasets);
router.get('/analysis/data/read/:datasetid', auth, checkDatabaseStatus, ctrlDataset.datasetReadOne);
router.delete('/analysis/data/delete', auth, checkDatabaseStatus, ctrlDataset.deleteDatasetDB);

//Event (Logging)
router.post('/event', checkDatabaseStatus, ctrlEvent.event);



//File operations - download link, get info, update/upload, delete
router.get('/files/:filepath(*)/download', auth, checkDatabaseStatus, ctrlFile.signDownloadS3);
router.get('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.getFile);
router.put('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.putFile);
router.delete('/files/:filepath(*)', auth, checkDatabaseStatus, ctrlFile.deleteFile);

//Tag and criteria search of the file system
router.get('/files/?tags=:tags', auth, checkDatabaseStatus, ctrlUsers.getUserProfile);
router.get('/files/?search=:query', auth, checkDatabaseStatus, ctrlUsers.getUserProfile);

//Get (limited) file info for pins on the map based on some criteria. Ie. Limited in spatial or time range
router.get('/map', auth, checkDatabaseStatus, ctrlFile.map); //Route doesn't like eg. ?q=:query. I think you access that instead directly through Express?


router.post('/file/signUploadS3', auth, checkDatabaseStatus, ctrlFile.signUploadS3);
/*router.get('/files/signDownloadS3', auth, checkDatabaseStatus, ctrlFile.signDownloadS3);
router.get('/files/getFileListS3', auth, ctrlFile.getFileListS3);
router.post('/files/deleteFileS3', auth, checkDatabaseStatus, ctrlFile.deleteFileS3);
router.post('/files/addFileDB', auth, checkDatabaseStatus, ctrlFile.addFileDB);
router.get('/files/getFileListDB', auth, checkDatabaseStatus, ctrlFile.map);
router.get('/files/fileReadOneDB', auth, checkDatabaseStatus, ctrlFile.fileReadOneDB);
router.delete('/files/deleteFileDB', auth, checkDatabaseStatus, ctrlFile.deleteFileDB);
router.post('/files/syncDBwithS3', auth, checkDatabaseStatus, ctrlFile.syncDBwithS3);
router.post('/files/objectAclS3', auth, checkDatabaseStatus, ctrlFile.objectAclS3);
router.post('/files/objectAclDB', auth, checkDatabaseStatus, ctrlFile.objectAclDB);
*/

//Analysis
router.post('/analysis/aylien/concept', auth, ctrlAnalysis.aylienConceptAnalysis);
router.post('/analysis/watson', auth, checkDatabaseStatus, ctrlAnalysis.watsonAnalysis);
router.post('/analysis/watson/save', auth, checkDatabaseStatus, ctrlAnalysis.saveWatsonAnalysis);
router.get('/analysis/watson/read', auth, checkDatabaseStatus, ctrlAnalysis.readWatsonAnalysis);
router.get('/analysis/watson/list', auth, checkDatabaseStatus, ctrlAnalysis.listWatsonAnalysis);
router.delete('/analysis/watson/delete', auth, checkDatabaseStatus, ctrlAnalysis.deleteWatsonAnalysis);

//Surveys
router.post('/survey/save', auth, checkDatabaseStatus, ctrlSurveys.saveSurvey);
router.get('/survey/read', auth, checkDatabaseStatus, ctrlSurveys.readSurvey);
router.get('/survey/list', auth, checkDatabaseStatus, ctrlSurveys.listSurveys);
router.delete('/survey/delete', auth, checkDatabaseStatus, ctrlSurveys.deleteSurvey);
router.post('/survey/response/save', auth, checkDatabaseStatus, ctrlSurveys.saveSurveyResponse);
router.get('/survey/responses/read', auth, checkDatabaseStatus, ctrlSurveys.readSurveyResponses);

module.exports = router;
