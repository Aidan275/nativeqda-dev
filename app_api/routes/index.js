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

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// datasets
router.post('/analysis/data/create', auth, ctrlDataset.datasetCreate);
router.get('/analysis/data', ctrlDataset.listDatasets);
router.get('/analysis/data/:datasetid', auth, ctrlDataset.datasetReadOne);
router.delete('/analysis/data/delete/:datasetid', auth, ctrlDataset.datasetDeleteOne);

router.post('/event', ctrlEvent.event);

module.exports = router;
