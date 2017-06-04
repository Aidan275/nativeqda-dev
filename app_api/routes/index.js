var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');
var ctrlAuth = require('../controllers/authentication');
var ctrlEvent = require('../controllers/events');
var ctrlDataset = require('../controllers/datasets');

router.get('/locations', auth, ctrlLocations.locationsListByDistance);
router.post('/locations', auth, ctrlLocations.locationsCreate);
router.get('/locations/:locationid', auth, ctrlLocations.locationsReadOne);
router.put('/locations/:locationid', auth, ctrlLocations.locationsUpdateOne);
router.delete('/locations/:locationid', auth, ctrlLocations.locationsDeleteOne);

// reviews
router.post('/locations/:locationid/reviews', auth, ctrlReviews.reviewsCreate);
router.get('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsReadOne);
router.put('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsUpdateOne);
router.delete('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsDeleteOne);

// datasets
router.post('/analysis/data/create', auth, ctrlDataset.datasetCreate);
router.get('/analysis/data', ctrlDataset.listDatasets);
router.delete('/analysis/data/delete/:datasetid', ctrlDataset.datasetDeleteOne);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.post('/event', ctrlEvent.event);

module.exports = router;
