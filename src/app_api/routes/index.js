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

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// datasets
router.post('/analysis/data/create', auth, ctrlDataset.datasetCreate);
router.get('/analysis/data/list', auth, ctrlDataset.listDatasets);
router.get('/analysis/data/read/:datasetid', auth, ctrlDataset.datasetReadOne);
router.delete('/analysis/data/delete', auth, ctrlDataset.deleteDatasetDB);

router.post('/event', ctrlEvent.event);

router.post('/files/signUploadS3', auth, ctrlFile.signUploadS3);
router.get('/files/signDownloadS3', auth, ctrlFile.signDownloadS3);
router.get('/files/getFileListS3', auth, ctrlFile.getFileListS3);
router.post('/files/deleteFileS3', auth, ctrlFile.deleteFileS3);
router.post('/files/addFileDB', auth, ctrlFile.addFileDB);
router.get('/files/getFileListDB', auth, ctrlFile.getFileListDB);
router.get('/files/fileReadOneDB', auth, ctrlFile.fileReadOneDB);
router.delete('/files/deleteFileDB', auth, ctrlFile.deleteFileDB);
router.post('/files/syncDBwithS3', auth, ctrlFile.syncDBwithS3);
router.post('/files/objectAclS3', auth, ctrlFile.objectAclS3);
router.post('/files/objectAclDB', auth, ctrlFile.objectAclDB);

router.post('/analysis/aylien/concept', auth, ctrlAnalysis.aylienConceptAnalysis);
router.post('/analysis/watson', auth, ctrlAnalysis.watsonNLUAnalysis);
router.post('/analysis/watson-concept-analysis', auth, ctrlAnalysis.watsonConceptAnalysis);

router.get('/users/info', auth, ctrlUsers.getUserInfo);

module.exports = router;
